package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"publicwelfare/config"
	"publicwelfare/models"
	"publicwelfare/utils"
)

func ApplyVolunteer(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		RealName string `json:"real_name" binding:"required"`
		Phone    string `json:"phone" binding:"required"`
		IDCard   string `json:"id_card"`
		Age      int    `json:"age"`
		Gender   string `json:"gender"`
		Skills   string `json:"skills"`
		Reason   string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var existing models.VolunteerApplication
	if config.DB.Where("user_id = ? AND status = 0", userID).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "已有待审核的申请"))
		return
	}

	var volunteer models.Volunteer
	if config.DB.Where("user_id = ?", userID).First(&volunteer).Error == nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "已是志愿者"))
		return
	}

	application := models.VolunteerApplication{
		UserID:   userID,
		RealName: data.RealName,
		Phone:    data.Phone,
		IDCard:   data.IDCard,
		Age:      data.Age,
		Gender:   data.Gender,
		Skills:   data.Skills,
		Reason:   data.Reason,
		Status:   0,
	}

	if err := config.DB.Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "申请失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("申请成功", gin.H{"application_id": application.ID}))
}

func GetVolunteerApplication(c *gin.Context) {
	userID := c.GetUint("user_id")

	var applications []models.VolunteerApplication
	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取申请记录失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(applications))
}

func GetVolunteerInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var volunteer models.Volunteer
	if err := config.DB.Where("user_id = ?", userID).First(&volunteer).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "志愿者信息不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(volunteer))
}

func UpdateVolunteerInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var updateData struct {
		RealName   string `json:"real_name"`
		Phone      string `json:"phone"`
		IDCard     string `json:"id_card"`
		Age        int    `json:"age"`
		Gender     string `json:"gender"`
		Skills     string `json:"skills"`
		Experience string `json:"experience"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var volunteer models.Volunteer
	if err := config.DB.Where("user_id = ?", userID).First(&volunteer).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "志愿者信息不存在"))
		return
	}

	updates := make(map[string]interface{})
	if updateData.RealName != "" {
		updates["real_name"] = updateData.RealName
	}
	if updateData.Phone != "" {
		updates["phone"] = updateData.Phone
	}
	if updateData.IDCard != "" {
		updates["id_card"] = updateData.IDCard
	}
	if updateData.Age > 0 {
		updates["age"] = updateData.Age
	}
	if updateData.Gender != "" {
		updates["gender"] = updateData.Gender
	}
	if updateData.Skills != "" {
		updates["skills"] = updateData.Skills
	}
	if updateData.Experience != "" {
		updates["experience"] = updateData.Experience
	}

	if len(updates) > 0 {
		if err := config.DB.Model(&volunteer).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
			return
		}
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func RegisterActivity(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		ActivityID uint `json:"activity_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var volunteer models.Volunteer
	if err := config.DB.Where("user_id = ?", userID).First(&volunteer).Error; err != nil {
		c.JSON(http.StatusForbidden, utils.Error(403, "需要志愿者身份"))
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, data.ActivityID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "活动不存在"))
		return
	}

	if activity.Status != 1 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "活动不可报名"))
		return
	}

	if activity.MaxPeople > 0 && activity.CurrentPeople >= activity.MaxPeople {
		c.JSON(http.StatusBadRequest, utils.Error(400, "活动名额已满"))
		return
	}

	var existing models.Registration
	if config.DB.Where("volunteer_id = ? AND activity_id = ? AND status = 1", volunteer.ID, data.ActivityID).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "已报名该活动"))
		return
	}

	registration := models.Registration{
		VolunteerID: volunteer.ID,
		ActivityID:  data.ActivityID,
		Status:      1,
	}

	if err := config.DB.Create(&registration).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "报名失败"))
		return
	}

	config.DB.Model(&activity).Update("current_people", activity.CurrentPeople+1)

	c.JSON(http.StatusOK, utils.SuccessWithMessage("报名成功", gin.H{"registration_id": registration.ID}))
}

func CancelRegistration(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var volunteer models.Volunteer
	if err := config.DB.Where("user_id = ?", userID).First(&volunteer).Error; err != nil {
		c.JSON(http.StatusForbidden, utils.Error(403, "需要志愿者身份"))
		return
	}

	var registration models.Registration
	if err := config.DB.Where("id = ? AND volunteer_id = ?", id, volunteer.ID).First(&registration).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "报名记录不存在"))
		return
	}

	if registration.Status != 1 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "无法取消该报名"))
		return
	}

	registration.Status = 2
	if err := config.DB.Save(&registration).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "取消失败"))
		return
	}

	var activity models.Activity
	config.DB.First(&activity, registration.ActivityID)
	if activity.CurrentPeople > 0 {
		config.DB.Model(&activity).Update("current_people", activity.CurrentPeople-1)
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("取消成功", nil))
}

func GetVolunteerRegistrations(c *gin.Context) {
	userID := c.GetUint("user_id")

	var volunteer models.Volunteer
	if err := config.DB.Where("user_id = ?", userID).First(&volunteer).Error; err != nil {
		c.JSON(http.StatusForbidden, utils.Error(403, "需要志愿者身份"))
		return
	}

	var registrations []models.Registration
	if err := config.DB.Preload("Activity").Where("volunteer_id = ?", volunteer.ID).Order("created_at DESC").Find(&registrations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取报名列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(registrations))
}

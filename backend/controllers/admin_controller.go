package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"publicwelfare/config"
	"publicwelfare/models"
	"publicwelfare/utils"
)

func GetAdminInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var admin models.Admin
	if err := config.DB.First(&admin, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "管理员不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(admin))
}

func UpdateAdminInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var updateData struct {
		RealName string `json:"real_name"`
		Phone    string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var admin models.Admin
	if err := config.DB.First(&admin, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "管理员不存在"))
		return
	}

	updates := make(map[string]interface{})
	if updateData.RealName != "" {
		updates["real_name"] = updateData.RealName
	}
	if updateData.Phone != "" {
		updates["phone"] = updateData.Phone
	}

	if len(updates) > 0 {
		if err := config.DB.Model(&admin).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
			return
		}
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func ChangeAdminPassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var passwordData struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&passwordData); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var admin models.Admin
	if err := config.DB.First(&admin, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "管理员不存在"))
		return
	}

	if !utils.CheckPassword(passwordData.OldPassword, admin.Password) {
		c.JSON(http.StatusBadRequest, utils.Error(400, "原密码错误"))
		return
	}

	hashedPassword, err := utils.HashPassword(passwordData.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "密码加密失败"))
		return
	}

	admin.Password = hashedPassword
	if err := config.DB.Save(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "修改密码失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("密码修改成功", nil))
}

func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var users []models.User
	var total int64

	config.DB.Model(&models.User{}).Count(&total)
	if err := config.DB.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取用户列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      users,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetUserById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "用户不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(user))
}

func UpdateUserStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var data struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "用户不存在"))
		return
	}

	user.Status = data.Status
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func GetVolunteers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var volunteers []models.Volunteer
	var total int64

	config.DB.Model(&models.Volunteer{}).Count(&total)
	if err := config.DB.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&volunteers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取志愿者列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      volunteers,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetVolunteerById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var volunteer models.Volunteer
	if err := config.DB.First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "志愿者不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(volunteer))
}

func UpdateVolunteerStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var data struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var volunteer models.Volunteer
	if err := config.DB.First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "志愿者不存在"))
		return
	}

	volunteer.Status = data.Status
	if err := config.DB.Save(&volunteer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func GetVolunteerApplications(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var applications []models.VolunteerApplication
	var total int64

	query := config.DB.Model(&models.VolunteerApplication{})
	if status != "" {
		statusInt, _ := strconv.Atoi(status)
		query = query.Where("status = ?", statusInt)
	}

	query.Count(&total)
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取申请列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      applications,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func ApproveVolunteerApplication(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var application models.VolunteerApplication
	if err := config.DB.First(&application, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "申请不存在"))
		return
	}

	if application.Status != 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "该申请已处理"))
		return
	}

	application.Status = 1
	application.UpdatedAt = time.Now()
	if err := config.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "审核失败"))
		return
	}

	var existingVolunteer models.Volunteer
	if config.DB.Where("user_id = ?", application.UserID).First(&existingVolunteer).Error == nil {
		c.JSON(http.StatusOK, utils.SuccessWithMessage("审核通过", nil))
		return
	}

	volunteer := models.Volunteer{
		UserID:     application.UserID,
		RealName:   application.RealName,
		Phone:      application.Phone,
		IDCard:     application.IDCard,
		Age:        application.Age,
		Gender:     application.Gender,
		Skills:     application.Skills,
		Status:     1,
	}

	if err := config.DB.Create(&volunteer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建志愿者失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("审核通过", nil))
}

func RejectVolunteerApplication(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var application models.VolunteerApplication
	if err := config.DB.First(&application, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "申请不存在"))
		return
	}

	if application.Status != 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "该申请已处理"))
		return
	}

	application.Status = 2
	application.UpdatedAt = time.Now()
	if err := config.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "审核失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("已拒绝", nil))
}

func GetAllActivities(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var activities []models.Activity
	var total int64

	config.DB.Model(&models.Activity{}).Count(&total)
	if err := config.DB.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&activities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取活动列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      activities,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateActivity(c *gin.Context) {
	var data struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		Location    string `json:"location"`
		StartTime   string `json:"start_time"`
		EndTime     string `json:"end_time"`
		MaxPeople   int    `json:"max_people"`
		Image       string `json:"image"`
		Status      int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var startTime, endTime time.Time
	if data.StartTime != "" {
		startTime, _ = time.Parse("2006-01-02 15:04:05", data.StartTime)
	}
	if data.EndTime != "" {
		endTime, _ = time.Parse("2006-01-02 15:04:05", data.EndTime)
	}

	activity := models.Activity{
		Title:         data.Title,
		Description:   data.Description,
		Location:      data.Location,
		StartTime:     startTime,
		EndTime:       endTime,
		MaxPeople:     data.MaxPeople,
		CurrentPeople: 0,
		Image:         data.Image,
		Status:        data.Status,
	}

	if err := config.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建活动失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", gin.H{"activity_id": activity.ID}))
}

func GetActivityById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "活动不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(activity))
}

func UpdateActivity(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "活动不存在"))
		return
	}

	var data struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Location    string `json:"location"`
		StartTime   string `json:"start_time"`
		EndTime     string `json:"end_time"`
		MaxPeople   int    `json:"max_people"`
		Image       string `json:"image"`
		Status      int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if data.Title != "" {
		updates["title"] = data.Title
	}
	if data.Description != "" {
		updates["description"] = data.Description
	}
	if data.Location != "" {
		updates["location"] = data.Location
	}
	if data.StartTime != "" {
		startTime, _ := time.Parse("2006-01-02 15:04:05", data.StartTime)
		updates["start_time"] = startTime
	}
	if data.EndTime != "" {
		endTime, _ := time.Parse("2006-01-02 15:04:05", data.EndTime)
		updates["end_time"] = endTime
	}
	if data.MaxPeople > 0 {
		updates["max_people"] = data.MaxPeople
	}
	if data.Image != "" {
		updates["image"] = data.Image
	}

	if len(updates) > 0 {
		if err := config.DB.Model(&activity).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
			return
		}
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteActivity(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if err := config.DB.Delete(&models.Activity{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func UpdateActivityStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var data struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "活动不存在"))
		return
	}

	activity.Status = data.Status
	if err := config.DB.Save(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func GetActivityApplications(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var applications []models.Application
	var total int64

	query := config.DB.Model(&models.Application{}).Preload("Activity")
	if status != "" {
		statusInt, _ := strconv.Atoi(status)
		query = query.Where("status = ?", statusInt)
	}

	query.Count(&total)
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取申请列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      applications,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func ApproveActivityApplication(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var application models.Application
	if err := config.DB.First(&application, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "申请不存在"))
		return
	}

	if application.Status != 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "该申请已处理"))
		return
	}

	application.Status = 1
	application.UpdatedAt = time.Now()
	if err := config.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "审核失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("审核通过", nil))
}

func RejectActivityApplication(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var application models.Application
	if err := config.DB.First(&application, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "申请不存在"))
		return
	}

	if application.Status != 0 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "该申请已处理"))
		return
	}

	application.Status = 2
	application.UpdatedAt = time.Now()
	if err := config.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "审核失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("已拒绝", nil))
}

func GetAllRegistrations(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var registrations []models.Registration
	var total int64

	config.DB.Model(&models.Registration{}).Preload("Activity").Count(&total)
	if err := config.DB.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&registrations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取报名列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      registrations,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func GetAllBanners(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var banners []models.Banner
	var total int64

	config.DB.Model(&models.Banner{}).Count(&total)
	if err := config.DB.Order("sort ASC, created_at DESC").Offset(offset).Limit(pageSize).Find(&banners).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取轮播图列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      banners,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateBanner(c *gin.Context) {
	var data struct {
		Title  string `json:"title"`
		Image  string `json:"image" binding:"required"`
		Link   string `json:"link"`
		Sort   int    `json:"sort"`
		Status int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	banner := models.Banner{
		Title:  data.Title,
		Image:  data.Image,
		Link:   data.Link,
		Sort:   data.Sort,
		Status: 1,
	}

	if err := config.DB.Create(&banner).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建轮播图失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", gin.H{"banner_id": banner.ID}))
}

func GetBannerById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var banner models.Banner
	if err := config.DB.First(&banner, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "轮播图不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(banner))
}

func UpdateBanner(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var banner models.Banner
	if err := config.DB.First(&banner, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "轮播图不存在"))
		return
	}

	var data struct {
		Title  string `json:"title"`
		Image  string `json:"image"`
		Link   string `json:"link"`
		Sort   int    `json:"sort"`
		Status int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if data.Title != "" {
		updates["title"] = data.Title
	}
	if data.Image != "" {
		updates["image"] = data.Image
	}
	if data.Link != "" {
		updates["link"] = data.Link
	}
	updates["sort"] = data.Sort
	updates["status"] = data.Status

	if len(updates) > 0 {
		if err := config.DB.Model(&banner).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
			return
		}
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteBanner(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if err := config.DB.Delete(&models.Banner{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func GetAllNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var news []models.News
	var total int64

	config.DB.Model(&models.News{}).Count(&total)
	if err := config.DB.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取新闻列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      news,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func CreateNews(c *gin.Context) {
	var data struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content"`
		Image   string `json:"image"`
		Type    string `json:"type"`
		Author  string `json:"author"`
		Status  int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	news := models.News{
		Title:     data.Title,
		Content:   data.Content,
		Image:     data.Image,
		Type:      data.Type,
		Author:    data.Author,
		ViewCount: 0,
		Status:    1,
	}

	if err := config.DB.Create(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "创建新闻失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("创建成功", gin.H{"news_id": news.ID}))
}

func GetNewsById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var news models.News
	if err := config.DB.First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "新闻不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(news))
}

func UpdateNews(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var news models.News
	if err := config.DB.First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "新闻不存在"))
		return
	}

	var data struct {
		Title   string `json:"title"`
		Content string `json:"content"`
		Image   string `json:"image"`
		Type    string `json:"type"`
		Author  string `json:"author"`
		Status  int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	updates := make(map[string]interface{})
	if data.Title != "" {
		updates["title"] = data.Title
	}
	if data.Content != "" {
		updates["content"] = data.Content
	}
	if data.Image != "" {
		updates["image"] = data.Image
	}
	if data.Type != "" {
		updates["type"] = data.Type
	}
	if data.Author != "" {
		updates["author"] = data.Author
	}
	updates["status"] = data.Status

	if len(updates) > 0 {
		if err := config.DB.Model(&news).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
			return
		}
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func DeleteNews(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	if err := config.DB.Delete(&models.News{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "删除失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("删除成功", nil))
}

func GetAllMessages(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var messages []models.Message
	var total int64

	config.DB.Model(&models.Message{}).Count(&total)
	if err := config.DB.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取留言列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"list":      messages,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}))
}

func ReplyMessage(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var data struct {
		Reply string `json:"reply" binding:"required"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var message models.Message
	if err := config.DB.First(&message, id).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "留言不存在"))
		return
	}

	now := time.Now()
	message.Reply = data.Reply
	message.RepliedAt = &now
	message.Status = 1
	message.UpdatedAt = now

	if err := config.DB.Save(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "回复失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("回复成功", nil))
}

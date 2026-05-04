package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"publicwelfare/config"
	"publicwelfare/models"
	"publicwelfare/utils"
)

func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var existingUser models.User
	if config.DB.Where("username = ?", user.Username).First(&existingUser).Error == nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "用户名已存在"))
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "密码加密失败"))
		return
	}
	user.Password = hashedPassword
	user.Status = 1

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "注册失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("注册成功", gin.H{"user_id": user.ID}))
}

func Login(c *gin.Context) {
	var loginData struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var user models.User
	if err := config.DB.Where("username = ?", loginData.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, utils.Error(401, "用户名或密码错误"))
		return
	}

	if user.Status != 1 {
		c.JSON(http.StatusForbidden, utils.Error(403, "账号已被禁用"))
		return
	}

	if !utils.CheckPassword(loginData.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, utils.Error(401, "用户名或密码错误"))
		return
	}

	role := "user"
	var volunteer models.Volunteer
	if config.DB.Where("user_id = ?", user.ID).First(&volunteer).Error == nil {
		if volunteer.Status == 1 {
			role = "volunteer"
		}
	}

	token, err := utils.GenerateToken(user.ID, user.Username, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "生成Token失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"token":    token,
		"user_id":  user.ID,
		"username": user.Username,
		"role":     role,
	}))
}

func AdminLogin(c *gin.Context) {
	var loginData struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var admin models.Admin
	if err := config.DB.Where("username = ?", loginData.Username).First(&admin).Error; err != nil {
		c.JSON(http.StatusUnauthorized, utils.Error(401, "用户名或密码错误"))
		return
	}

	if admin.Status != 1 {
		c.JSON(http.StatusForbidden, utils.Error(403, "账号已被禁用"))
		return
	}

	if !utils.CheckPassword(loginData.Password, admin.Password) {
		c.JSON(http.StatusUnauthorized, utils.Error(401, "用户名或密码错误"))
		return
	}

	token, err := utils.GenerateToken(admin.ID, admin.Username, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "生成Token失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(gin.H{
		"token":    token,
		"user_id":  admin.ID,
		"username": admin.Username,
		"role":     "admin",
	}))
}

func GetUserInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "用户不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(user))
}

func UpdateUserInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var updateData struct {
		RealName string `json:"real_name"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Address  string `json:"address"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "用户不存在"))
		return
	}

	updates := make(map[string]interface{})
	if updateData.RealName != "" {
		updates["real_name"] = updateData.RealName
	}
	if updateData.Phone != "" {
		updates["phone"] = updateData.Phone
	}
	if updateData.Email != "" {
		updates["email"] = updateData.Email
	}
	if updateData.Address != "" {
		updates["address"] = updateData.Address
	}

	if len(updates) > 0 {
		if err := config.DB.Model(&user).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, utils.Error(500, "更新失败"))
			return
		}
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("更新成功", nil))
}

func ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var passwordData struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&passwordData); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "用户不存在"))
		return
	}

	if !utils.CheckPassword(passwordData.OldPassword, user.Password) {
		c.JSON(http.StatusBadRequest, utils.Error(400, "原密码错误"))
		return
	}

	hashedPassword, err := utils.HashPassword(passwordData.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "密码加密失败"))
		return
	}

	user.Password = hashedPassword
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "修改密码失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("密码修改成功", nil))
}

func GetFavorites(c *gin.Context) {
	userID := c.GetUint("user_id")

	var favorites []models.Favorite
	if err := config.DB.Preload("Activity").Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取收藏列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(favorites))
}

func AddFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		ActivityID uint `json:"activity_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, data.ActivityID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "活动不存在"))
		return
	}

	var existing models.Favorite
	if config.DB.Where("user_id = ? AND activity_id = ?", userID, data.ActivityID).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "已收藏该活动"))
		return
	}

	favorite := models.Favorite{
		UserID:     userID,
		ActivityID: data.ActivityID,
	}

	if err := config.DB.Create(&favorite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "收藏失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("收藏成功", nil))
}

func RemoveFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var favorite models.Favorite
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&favorite).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "收藏不存在"))
		return
	}

	if err := config.DB.Delete(&favorite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "取消收藏失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("取消收藏成功", nil))
}

func CreateMessage(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	message := models.Message{
		UserID:  userID,
		Content: data.Content,
		Status:  0,
	}

	if err := config.DB.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "留言失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("留言成功", nil))
}

func GetMessages(c *gin.Context) {
	userID := c.GetUint("user_id")

	var messages []models.Message
	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取留言列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(messages))
}

func GetMessageDetail(c *gin.Context) {
	userID := c.GetUint("user_id")
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "参数错误"))
		return
	}

	var message models.Message
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&message).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "留言不存在"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(message))
}

func ApplyActivity(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		ActivityID uint   `json:"activity_id" binding:"required"`
		Reason      string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "请求参数错误"))
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, data.ActivityID).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.Error(404, "活动不存在"))
		return
	}

	if activity.Status != 1 {
		c.JSON(http.StatusBadRequest, utils.Error(400, "活动不可申请"))
		return
	}

	var existing models.Application
	if config.DB.Where("user_id = ? AND activity_id = ?", userID, data.ActivityID).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, utils.Error(400, "已申请过该活动"))
		return
	}

	application := models.Application{
		UserID:     userID,
		ActivityID: data.ActivityID,
		Reason:     data.Reason,
		Status:     0,
	}

	if err := config.DB.Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "申请失败"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessWithMessage("申请成功", gin.H{"application_id": application.ID}))
}

func GetUserApplications(c *gin.Context) {
	userID := c.GetUint("user_id")

	var applications []models.Application
	if err := config.DB.Preload("Activity").Where("user_id = ?", userID).Order("created_at DESC").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取申请列表失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(applications))
}

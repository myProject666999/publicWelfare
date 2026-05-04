package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"publicwelfare/config"
	"publicwelfare/models"
	"publicwelfare/utils"
)

func GetBanners(c *gin.Context) {
	var banners []models.Banner
	if err := config.DB.Where("status = 1").Order("sort ASC, created_at DESC").Find(&banners).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.Error(500, "获取轮播图失败"))
		return
	}

	c.JSON(http.StatusOK, utils.Success(banners))
}

func GetNewsList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	newsType := c.Query("type")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	var news []models.News
	var total int64

	query := config.DB.Model(&models.News{}).Where("status = 1")
	if newsType != "" {
		query = query.Where("type = ?", newsType)
	}

	query.Count(&total)

	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&news).Error; err != nil {
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

func GetNewsDetail(c *gin.Context) {
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

	if news.Status != 1 {
		c.JSON(http.StatusNotFound, utils.Error(404, "新闻不存在"))
		return
	}

	news.ViewCount++
	config.DB.Model(&news).Update("view_count", news.ViewCount)

	c.JSON(http.StatusOK, utils.Success(news))
}

func GetActivities(c *gin.Context) {
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

	var activities []models.Activity
	var total int64

	query := config.DB.Model(&models.Activity{})
	if status != "" {
		statusInt, _ := strconv.Atoi(status)
		query = query.Where("status = ?", statusInt)
	} else {
		query = query.Where("status = 1")
	}

	query.Count(&total)

	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&activities).Error; err != nil {
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

func GetActivityDetail(c *gin.Context) {
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

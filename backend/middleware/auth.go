package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"publicwelfare/utils"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, utils.Error(401, "未登录或登录已过期"))
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, utils.Error(401, "认证格式错误"))
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, utils.Error(401, "登录已过期或无效"))
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, utils.Error(403, "无权限访问"))
			c.Abort()
			return
		}
		c.Next()
	}
}

func VolunteerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || (role != "volunteer" && role != "admin") {
			c.JSON(http.StatusForbidden, utils.Error(403, "需要志愿者权限"))
			c.Abort()
			return
		}
		c.Next()
	}
}

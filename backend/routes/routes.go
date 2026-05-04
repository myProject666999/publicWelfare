package routes

import (
	"github.com/gin-gonic/gin"
	"publicwelfare/controllers"
	"publicwelfare/middleware"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)
		api.POST("/admin/login", controllers.AdminLogin)

		api.GET("/banners", controllers.GetBanners)
		api.GET("/news", controllers.GetNewsList)
		api.GET("/news/:id", controllers.GetNewsDetail)
		api.GET("/activities", controllers.GetActivities)
		api.GET("/activities/:id", controllers.GetActivityDetail)

		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/user/info", controllers.GetUserInfo)
			auth.PUT("/user/info", controllers.UpdateUserInfo)
			auth.PUT("/user/password", controllers.ChangePassword)

			auth.GET("/user/favorites", controllers.GetFavorites)
			auth.POST("/user/favorites", controllers.AddFavorite)
			auth.DELETE("/user/favorites/:id", controllers.RemoveFavorite)

			auth.POST("/messages", controllers.CreateMessage)
			auth.GET("/messages", controllers.GetMessages)
			auth.GET("/messages/:id", controllers.GetMessageDetail)

			auth.POST("/volunteer/apply", controllers.ApplyVolunteer)
			auth.GET("/volunteer/application", controllers.GetVolunteerApplication)

			auth.POST("/activities/apply", controllers.ApplyActivity)
			auth.GET("/user/applications", controllers.GetUserApplications)

			volunteer := auth.Group("")
			volunteer.Use(middleware.VolunteerMiddleware())
			{
				volunteer.GET("/volunteer/info", controllers.GetVolunteerInfo)
				volunteer.PUT("/volunteer/info", controllers.UpdateVolunteerInfo)

				volunteer.POST("/activities/register", controllers.RegisterActivity)
				volunteer.DELETE("/activities/register/:id", controllers.CancelRegistration)
				volunteer.GET("/volunteer/registrations", controllers.GetVolunteerRegistrations)
			}

			admin := auth.Group("/admin")
			admin.Use(middleware.AdminMiddleware())
			{
				admin.GET("/info", controllers.GetAdminInfo)
				admin.PUT("/info", controllers.UpdateAdminInfo)
				admin.PUT("/password", controllers.ChangeAdminPassword)

				admin.GET("/users", controllers.GetUsers)
				admin.GET("/users/:id", controllers.GetUserById)
				admin.PUT("/users/:id/status", controllers.UpdateUserStatus)
				admin.DELETE("/users/:id", controllers.DeleteUser)

				admin.GET("/volunteers", controllers.GetVolunteers)
				admin.GET("/volunteers/:id", controllers.GetVolunteerById)
				admin.PUT("/volunteers/:id/status", controllers.UpdateVolunteerStatus)

				admin.GET("/volunteer-applications", controllers.GetVolunteerApplications)
				admin.PUT("/volunteer-applications/:id/approve", controllers.ApproveVolunteerApplication)
				admin.PUT("/volunteer-applications/:id/reject", controllers.RejectVolunteerApplication)

				admin.GET("/activities", controllers.GetAllActivities)
				admin.POST("/activities", controllers.CreateActivity)
				admin.GET("/activities/:id", controllers.GetActivityById)
				admin.PUT("/activities/:id", controllers.UpdateActivity)
				admin.DELETE("/activities/:id", controllers.DeleteActivity)
				admin.PUT("/activities/:id/status", controllers.UpdateActivityStatus)

				admin.GET("/activity-applications", controllers.GetActivityApplications)
				admin.PUT("/activity-applications/:id/approve", controllers.ApproveActivityApplication)
				admin.PUT("/activity-applications/:id/reject", controllers.RejectActivityApplication)

				admin.GET("/registrations", controllers.GetAllRegistrations)

				admin.GET("/banners", controllers.GetAllBanners)
				admin.POST("/banners", controllers.CreateBanner)
				admin.GET("/banners/:id", controllers.GetBannerById)
				admin.PUT("/banners/:id", controllers.UpdateBanner)
				admin.DELETE("/banners/:id", controllers.DeleteBanner)

				admin.GET("/news", controllers.GetAllNews)
				admin.POST("/news", controllers.CreateNews)
				admin.GET("/news/:id", controllers.GetNewsById)
				admin.PUT("/news/:id", controllers.UpdateNews)
				admin.DELETE("/news/:id", controllers.DeleteNews)

				admin.GET("/messages", controllers.GetAllMessages)
				admin.PUT("/messages/:id/reply", controllers.ReplyMessage)
			}
		}
	}
}

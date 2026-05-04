package config

import (
	"fmt"
	"log"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"publicwelfare/models"
)

var DB *gorm.DB

func InitDB() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port, dbname)

	var err error
	DB, err = gorm.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB.AutoMigrate(
		&models.User{},
		&models.Volunteer{},
		&models.Admin{},
		&models.Activity{},
		&models.News{},
		&models.Banner{},
		&models.Message{},
		&models.Favorite{},
		&models.Application{},
		&models.Registration{},
		&models.VolunteerApplication{},
	)

	log.Println("Database connected and migrated successfully")
}

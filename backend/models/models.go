package models

import (
	"time"

	"github.com/jinzhu/gorm"
)

type User struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Username  string     `gorm:"unique_index;not null" json:"username"`
	Password  string     `gorm:"not null" json:"-"`
	RealName  string     `json:"real_name"`
	Phone     string     `json:"phone"`
	Email     string     `json:"email"`
	Address   string     `json:"address"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

type Volunteer struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	UserID      uint       `gorm:"unique_index;not null" json:"user_id"`
	RealName    string     `gorm:"not null" json:"real_name"`
	Phone       string     `gorm:"not null" json:"phone"`
	IDCard      string     `json:"id_card"`
	Age         int        `json:"age"`
	Gender      string     `json:"gender"`
	Skills      string     `json:"skills"`
	Experience  string     `json:"experience"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}

type Admin struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Username  string     `gorm:"unique_index;not null" json:"username"`
	Password  string     `gorm:"not null" json:"-"`
	RealName  string     `json:"real_name"`
	Phone     string     `json:"phone"`
	Role      string     `gorm:"default:'admin'" json:"role"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

type Activity struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	Location    string     `json:"location"`
	StartTime   time.Time  `json:"start_time"`
	EndTime     time.Time  `json:"end_time"`
	MaxPeople   int        `gorm:"default:0" json:"max_people"`
	CurrentPeople int     `gorm:"default:0" json:"current_people"`
	Image       string     `json:"image"`
	Status      int        `gorm:"default:0" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}

type News struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Content     string     `gorm:"type:text" json:"content"`
	Image       string     `json:"image"`
	Type        string     `json:"type"`
	Author      string     `json:"author"`
	ViewCount   int        `gorm:"default:0" json:"view_count"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}

type Banner struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Title     string     `json:"title"`
	Image     string     `gorm:"not null" json:"image"`
	Link      string     `json:"link"`
	Sort      int        `gorm:"default:0" json:"sort"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

type Message struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `gorm:"not null" json:"user_id"`
	Content   string     `gorm:"type:text;not null" json:"content"`
	Reply     string     `gorm:"type:text" json:"reply"`
	RepliedAt *time.Time `json:"replied_at"`
	Status    int        `gorm:"default:0" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

type Favorite struct {
	ID         uint       `gorm:"primary_key" json:"id"`
	UserID     uint       `gorm:"not null" json:"user_id"`
	ActivityID uint       `gorm:"not null" json:"activity_id"`
	Activity   Activity   `gorm:"foreignkey:ActivityID" json:"activity"`
	CreatedAt  time.Time  `json:"created_at"`
	DeletedAt  *time.Time `sql:"index" json:"-"`
}

type Application struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	UserID      uint       `gorm:"not null" json:"user_id"`
	ActivityID  uint       `gorm:"not null" json:"activity_id"`
	Activity    Activity   `gorm:"foreignkey:ActivityID" json:"activity"`
	Reason      string     `gorm:"type:text" json:"reason"`
	Status      int        `gorm:"default:0" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}

type Registration struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	VolunteerID uint       `gorm:"not null" json:"volunteer_id"`
	ActivityID  uint       `gorm:"not null" json:"activity_id"`
	Activity    Activity   `gorm:"foreignkey:ActivityID" json:"activity"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}

type VolunteerApplication struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `gorm:"not null" json:"user_id"`
	RealName  string     `gorm:"not null" json:"real_name"`
	Phone     string     `gorm:"not null" json:"phone"`
	IDCard    string     `json:"id_card"`
	Age       int        `json:"age"`
	Gender    string     `json:"gender"`
	Skills    string     `json:"skills"`
	Reason    string     `gorm:"type:text" json:"reason"`
	Status    int        `gorm:"default:0" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (user *User) BeforeCreate(scope *gorm.Scope) error {
	scope.SetColumn("CreatedAt", time.Now())
	scope.SetColumn("UpdatedAt", time.Now())
	return nil
}

func (user *User) BeforeUpdate(scope *gorm.Scope) error {
	scope.SetColumn("UpdatedAt", time.Now())
	return nil
}

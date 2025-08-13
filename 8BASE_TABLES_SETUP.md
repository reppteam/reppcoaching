# 8base Tables Setup Guide

Based on the analysis of `mockApi.ts`, here are all the tables you need to create in 8base for your dashboard application.

## 📋 Required Tables

### 1. **Users** (Already exists in 8base)
- **Fields**: id, email, firstName, lastName, role, assignedAdminId, accessStart, accessEnd, hasPaid, isActive, coachingTermStart, coachingTermEnd, createdAt, updatedAt
- **Relationships**: roles (many-to-many), student (one-to-one), coach (one-to-one)

### 2. **StudentProfiles**
- **Fields**: id, phone, businessName, location, targetMarket, strengths, challenges, goals, preferredContactMethod, availability, notes, createdAt, updatedAt
- **Relationships**: student (one-to-one with User)

### 3. **WeeklyReports**
- **Fields**: id, start_date, end_date, new_clients, paid_shoots, free_shoots, unique_clients, aov, revenue, expenses, editing_cost, net_profit, status, createdAt, updatedAt
- **Relationships**: student (many-to-one with User)

### 4. **Goals**
- **Fields**: id, title, description, target_value, current_value, goal_type, deadline, priority, status, createdAt, updatedAt
- **Relationships**: student (many-to-one with User)

### 5. **Pricing**
- **Fields**: id, service_name, your_price, competitor_price, estimated_cost, estimated_profit, status, createdAt, updatedAt
- **Relationships**: student (many-to-one with User)

### 6. **Leads**
- **Fields**: id, lead_name, email, phone, instagram_handle, lead_source, initial_call_outcome, date_of_initial_call, last_followup_outcome, date_of_last_followup, next_followup_date, message_sent, followed_back, followed_up, status, createdAt, updatedAt, deletedAt
- **Relationships**: user (many-to-one with User), engagementTag (one-to-many), script_Component (one-to-one)

### 7. **EngagementTags**
- **Fields**: id, type, completed_date, notes
- **Relationships**: lead (many-to-one with Lead)

### 8. **ScriptComponents**
- **Fields**: id, intro, hook, body1, body2, ending
- **Relationships**: lead (one-to-one with Lead)

### 9. **CallLogs**
- **Fields**: id, call_date, call_duration, call_type, topics_discussed, outcome, next_steps, student_mood, createdAt, updatedAt
- **Relationships**: student (many-to-one with User), coach (many-to-one with User)

### 10. **Notes**
- **Fields**: id, target_type, target_id, user_id, content, visibility, created_at, created_by, created_by_name
- **Relationships**: None (uses target_type and target_id for polymorphic relationships)

### 11. **MessageTemplates**
- **Fields**: id, type, content, category, variation_number, is_active, createdAt, updatedAt
- **Relationships**: None

### 12. **GlobalVariables**
- **Fields**: id, hourly_pay, cost_per_photo, target_profit_margin, createdAt, updatedAt
- **Relationships**: student (many-to-one with User)

### 13. **Products**
- **Fields**: id, name, price, createdAt, updatedAt
- **Relationships**: student (many-to-one with User), subitems (one-to-many)

### 14. **Subitems**
- **Fields**: id, type, label, value, createdAt, updatedAt
- **Relationships**: product (many-to-one with Product)

## 🔧 Field Types

### Text Fields
- `email`, `firstName`, `lastName`, `lead_name`, `business_name`, `location`, `target_market`, `strengths`, `challenges`, `goals`, `notes`, `content`, `intro`, `hook`, `body1`, `body2`, `ending`, `outcome`, `next_steps`, `service_name`, `name`, `label`

### Number Fields
- `aov`, `revenue`, `expenses`, `editing_cost`, `net_profit`, `new_clients`, `paid_shoots`, `free_shoots`, `unique_clients`, `your_price`, `competitor_price`, `estimated_cost`, `estimated_profit`, `hourly_pay`, `cost_per_photo`, `target_profit_margin`, `price`, `value`, `call_duration`, `target_value`, `current_value`

### Date Fields
- `createdAt`, `updatedAt`, `start_date`, `end_date`, `date_of_initial_call`, `date_of_last_followup`, `next_followup_date`, `call_date`, `completed_date`, `deadline`, `accessStart`, `accessEnd`, `coachingTermStart`, `coachingTermEnd`

### Boolean Fields
- `message_sent`, `followed_back`, `followed_up`, `hasPaid`, `isActive`, `is_active`

### Enum Fields
- `status`: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'active' | 'inactive' | 'submitted'
- `goal_type`: 'revenue' | 'clients' | 'shoots' | 'other'
- `priority`: 'low' | 'medium' | 'high'
- `call_type`: 'scheduled' | 'follow_up' | 'emergency'
- `student_mood`: 'positive' | 'neutral' | 'frustrated' | 'motivated'
- `visibility`: 'public' | 'private'
- `type`: 'fixed' | 'photo' | 'labor' | 'intro' | 'hook' | 'body1' | 'body2' | 'ending' | 'follow_day_engagement' | 'engagement_day_1' | 'engagement_day_2' | 'dm_sent' | 'initial_call_done' | 'follow_up_call_done' | 'follow_up_dm_sent'

### Array Fields
- `topics_discussed`: String array

## 🔗 Relationships

### One-to-One
- User ↔ StudentProfile
- User ↔ Coach
- Lead ↔ ScriptComponents

### One-to-Many
- User → WeeklyReports
- User → Goals
- User → Pricing
- User → Leads
- User → CallLogs
- User → GlobalVariables
- User → Products
- Lead → EngagementTags
- Product → Subitems

### Many-to-Many
- User ↔ Roles

## 📊 Indexes to Create

For optimal performance, create indexes on:
- `users.email`
- `users.role`
- `users.assignedAdminId`
- `leads.user_id`
- `leads.status`
- `leads.createdAt`
- `weeklyReports.student_id`
- `weeklyReports.start_date`
- `callLogs.student_id`
- `callLogs.coach_id`
- `callLogs.call_date`

## 🚀 Implementation Steps

1. **Create Tables**: Use 8base Data Builder to create all tables with the specified fields
2. **Set Up Relationships**: Configure the relationships as specified above
3. **Create Indexes**: Add indexes for frequently queried fields
4. **Set Up Permissions**: Configure role-based access control
5. **Test Queries**: Use the provided GraphQL queries to test data operations
6. **Migrate Data**: If you have existing data, create migration scripts

## 📝 GraphQL Queries & Mutations

All the necessary GraphQL operations have been created in:
- `src/graphql/index.ts` - Main queries and mutations
- `src/services/8baseService.ts` - Service layer implementation

## 🔐 Permissions Setup

### Role-Based Access Control
- **Super Admin**: Full access to all tables
- **Coach Manager**: Access to coach and student data
- **Coach**: Access to assigned students' data
- **Student**: Access to own data only

### Table Permissions
- **Users**: Read/Write for admins, Read for coaches, Read own for students
- **StudentProfiles**: Read/Write for admins and coaches, Read/Write own for students
- **WeeklyReports**: Read/Write for admins and coaches, Read/Write own for students
- **Leads**: Read/Write for admins and coaches, Read/Write own for students
- **CallLogs**: Read/Write for admins and coaches, Read own for students
- **Notes**: Read/Write for admins and coaches, Read public for students

## 🎯 Next Steps

1. Create all tables in 8base Data Builder
2. Set up relationships and permissions
3. Test the GraphQL queries
4. Update your components to use the new 8base service
5. Remove mockApi.ts once everything is working

## 📞 Support

If you encounter any issues during setup, check:
1. Field type compatibility
2. Relationship configurations
3. Permission settings
4. GraphQL query syntax
5. Environment variables for 8base connection

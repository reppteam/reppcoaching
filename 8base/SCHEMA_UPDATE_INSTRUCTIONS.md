# 8base Schema Update Instructions

## Problem
The WeeklyReport table currently doesn't have a `student` field, which prevents coaches from seeing which student each weekly report belongs to.

## Solution
Add a `student` field to the WeeklyReport table that creates a relationship with the Student table.

## Step-by-Step Instructions

### 1. Go to 8base Workspace
- Log into your 8base workspace
- Navigate to **Data** → **Tables**

### 2. Edit WeeklyReport Table
- Find the **WeeklyReport** table
- Click on it to open the table editor

### 3. Add New Field
- Click **"Add Field"** button
- Set the following properties:
  - **Field Name**: `student`
  - **Display Name**: `Student`
  - **Field Type**: `Relation`
  - **Description**: `The student this weekly report belongs to`

### 4. Configure Relation
- **Related Table**: Select `Student`
- **Relation Type**: `Many-to-One` (WeeklyReport belongs to one Student)
- **Field Name**: `studentId`
- **Reference Field Name**: `weeklyReports`
- **Reference Display Name**: `Weekly Reports`

### 5. Save Changes
- Click **Save** to apply the changes
- Wait for the schema to regenerate

### 6. Test the Relationship
After adding the field, you can now use the mutation data like this:

```json
{
  "start_date": "2025-09-01",
  "end_date": "2025-09-07",
  "new_clients": 2,
  "paid_shoots": 2,
  "free_shoots": 0,
  "unique_clients": 2,
  "aov": 50,
  "revenue": 100,
  "expenses": 10,
  "editing_cost": 10,
  "net_profit": 80,
  "status": "completed",
  "student": { "connect": { "id": "student-id-here" } }
}
```

## What This Enables

1. **Coaches can see which student each weekly report belongs to**
2. **Students can see all their weekly reports**
3. **Proper data relationships for reporting and analytics**
4. **Filtering weekly reports by student**

## Updated GraphQL Operations

The GraphQL operations in `src/graphql/operations.ts` have already been updated to include the `student` field in:
- `CREATE_WEEKLY_REPORT`
- `GET_WEEKLY_REPORTS_BY_FILTER`
- `UPDATE_WEEKLY_REPORT`
- `GET_STUDENT_HIGHEST_REVENUE_BY_FILTER`

## Important Notes

- The `student` field is optional (not required) to maintain backward compatibility
- The relationship is Many-to-One: one student can have many weekly reports
- The `createdBy` field still tracks who created the report
- The `student` field tracks which student the report belongs to

## Troubleshooting

If you encounter issues:
1. Make sure the field name is exactly `student` (lowercase)
2. Verify the relation is set to `Student` table
3. Check that the relation type is `Many-to-One`
4. Wait for the schema to regenerate after saving

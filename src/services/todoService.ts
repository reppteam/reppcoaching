import { gql } from '@apollo/client';
import { convertLocalToUTC, debugTimezoneInfo } from '../utils/timezoneUtils';
import {
  TodoItem,
  Reminder,
  TodoList,
  CreateTodoInput,
  UpdateTodoInput,
  CreateReminderInput,
  UpdateReminderInput,
  User
} from '../types';
import {
  GET_TODOS_BY_USER,
  GET_SIMPLE_TODOS,
  GET_ALL_TODOS,
  GET_TODO_BY_ID,
  CREATE_TODO,
  UPDATE_TODO,
  DELETE_TODO,
  GET_REMINDERS_BY_USER,
  GET_ACTIVE_REMINDERS,
  GET_ALL_ACTIVE_REMINDERS,
  CREATE_REMINDER,
  UPDATE_REMINDER,
  DELETE_REMINDER,
  GET_TODO_LISTS_BY_USER,
  CREATE_TODO_LIST,
  UPDATE_TODO_LIST,
  DELETE_TODO_LIST
} from '../graphql/todos';

// We'll use the authenticated Apollo Client from the context instead of creating our own
let apolloClient: any = null;

export const setApolloClient = (client: any) => {
  apolloClient = client;
};

// Helper function to execute GraphQL queries
const executeQuery = async (query: any, variables?: any) => {
  console.log('executeQuery called with variables:', variables);
  console.log('Apollo Client available:', !!apolloClient);
  console.log('Query object:', query);
  
  if (!apolloClient) {
    console.error('Apollo Client not initialized. Please call setApolloClient first.');
    throw new Error('Apollo Client not initialized. Please call setApolloClient first.');
  }
  
  try {
    console.log('Executing GraphQL query...');
    const result = await apolloClient.query({
      query,
      variables,
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    });
    console.log('GraphQL query result:', result);
    return result.data;
  } catch (error) {
    console.error('GraphQL Query Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      graphQLErrors: (error as any)?.graphQLErrors,
      networkError: (error as any)?.networkError
    });
    throw error;
  }
};

// Helper function to execute GraphQL mutations
const executeMutation = async (mutation: any, variables?: any) => {
  if (!apolloClient) {
    throw new Error('Apollo Client not initialized. Please call setApolloClient first.');
  }
  
  try {
    const { data } = await apolloClient.mutate({
      mutation,
      variables,
      refetchQueries: ['GetTodosByUser', 'GetAllTodos'],
      awaitRefetchQueries: true
    });
    return data;
  } catch (error) {
    console.error('GraphQL Mutation Error:', error);
    console.error('Mutation error details:', {
      message: error instanceof Error ? error.message : String(error),
      graphQLErrors: (error as any)?.graphQLErrors,
      networkError: (error as any)?.networkError
    });
    throw error;
  }
};

class TodoService {
  // ============================================================================
  // TEST METHODS
  // ============================================================================
  
  // Removed testConnection method to reduce unnecessary queries

  // ============================================================================
  // TODO ITEMS METHODS
  // ============================================================================

  async getTodosByUser(userId: string): Promise<TodoItem[]> {
    try {
      console.log('getTodosByUser called with userId:', userId);
      const data = await executeQuery(GET_TODOS_BY_USER, { userId });
      console.log('getTodosByUser result:', data);
      return data.todoListsList?.items || [];
    } catch (error) {
      console.error('Error fetching todos by user:', error);
      throw error;
    }
  }

  async getAllTodos(first?: number, skip?: number, filter?: any): Promise<{ items: TodoItem[], count: number }> {
    try {
      const data = await executeQuery(GET_ALL_TODOS, { first, skip, filter });
      return {
        items: data.todosList?.items || [],
        count: data.todosList?.count || 0
      };
    } catch (error) {
      console.error('Error fetching all todos:', error);
      throw error;
    }
  }

  async getTodoById(id: string): Promise<TodoItem | null> {
    try {
      const data = await executeQuery(GET_TODO_BY_ID, { id });
      return data.todoList;
    } catch (error) {
      console.error('Error fetching todo by ID:', error);
      throw error;
    }
  }

  async createTodo(input: CreateTodoInput, assignedById: string): Promise<TodoItem> {
    try {
      const todoData = {
        title: input.title,
        description: input.description,
        assignedTo: { connect: { id: input.assignedToId } },
        assignedBy: { connect: { id: assignedById } },
        category: input.category,
        priority: input.priority,
        status: 'pending',
        dueDate: input.dueDate
      };

      const data = await executeMutation(CREATE_TODO, { data: todoData });
      return data.todoListCreate;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  async updateTodo(input: UpdateTodoInput): Promise<TodoItem> {
    try {
      const { id, ...updateData } = input;
      const todoData = {
        ...updateData,
        ...(input.status === 'completed' && {
          completedAt: new Date().toISOString().split('T')[0]
        })
      };

      const data = await executeMutation(UPDATE_TODO, { id, data: todoData });
      return data.todoListUpdate;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  async deleteTodo(id: string): Promise<boolean> {
    try {
      const data = await executeMutation(DELETE_TODO, { id });
      return data.todoListDelete?.success || false;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // ============================================================================
  // REMINDERS METHODS
  // ============================================================================

  async getRemindersByUser(userId: string): Promise<Reminder[]> {
    try {
      const data = await executeQuery(GET_REMINDERS_BY_USER, { userId });
      return data.remindersList?.items || [];
    } catch (error) {
      console.error('Error fetching reminders by user:', error);
      throw error;
    }
  }

  async getActiveReminders(userId: string): Promise<Reminder[]> {
    try {
      const data = await executeQuery(GET_ACTIVE_REMINDERS, { userId });
      return data.remindersList?.items || [];
    } catch (error) {
      console.error('Error fetching active reminders:', error);
      throw error;
    }
  }

  async createReminder(input: CreateReminderInput, userId: string): Promise<Reminder> {
    try {
      // Validate reminder input
      this.validateReminderInput(input);

      // Use timezone utilities for proper conversion
      const reminderDateTime = convertLocalToUTC(input.reminderDate, input.reminderTime);
      
      // Debug timezone conversion
      debugTimezoneInfo(input.reminderDate, input.reminderTime);
      
      const reminderData = {
        title: input.title,
        description: input.description,
        reminderDate: input.reminderDate,
        reminderTime: reminderDateTime,
        isActive: true,
        isRecurring: input.isRecurring || false,
        recurringPattern: input.recurringPattern,
        relatedTodoId: input.relatedTodoId,
        reminders: { connect: { id: userId } }
      };

      const data = await executeMutation(CREATE_REMINDER, { data: reminderData });
      
      // Schedule notification for the reminder
      await this.scheduleReminderNotification(data.reminderCreate);
      
      return data.reminderCreate;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async updateReminder(id: string, updateData: UpdateReminderInput): Promise<Reminder> {
    try {
      // The updateData should already have the properly formatted reminderTime
      // No need to format it again here
      const data = await executeMutation(UPDATE_REMINDER, { 
        id, 
        data: updateData
      });
      return data.reminderUpdate;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  async deleteReminder(id: string): Promise<boolean> {
    try {
      const data = await executeMutation(DELETE_REMINDER, { id });
      return data.reminderDelete?.success || false;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  // ============================================================================
  // TODO LISTS METHODS
  // ============================================================================

  async getTodoListsByUser(userId: string): Promise<TodoList[]> {
    try {
      const data = await executeQuery(GET_TODO_LISTS_BY_USER, { userId });
      return data.todoListsList?.items || [];
    } catch (error) {
      console.error('Error fetching todo lists by user:', error);
      throw error;
    }
  }

  async createTodoList(title: string, description: string, ownerId: string, isShared: boolean = false): Promise<TodoList> {
    try {
      const todoListData = {
        title,
        description,
        isShared,
        sharedWith: [],
        owner: { connect: { id: ownerId } }
      };

      const data = await executeMutation(CREATE_TODO_LIST, { data: todoListData });
      return data.todoListCreate;
    } catch (error) {
      console.error('Error creating todo list:', error);
      throw error;
    }
  }

  async updateTodoList(id: string, updateData: Partial<{ title: string, description: string, isShared: boolean, sharedWith: string[] }>): Promise<TodoList> {
    try {
      const data = await executeMutation(UPDATE_TODO_LIST, { 
        id, 
        data: updateData
      });
      return data.todoListUpdate;
    } catch (error) {
      console.error('Error updating todo list:', error);
      throw error;
    }
  }

  async deleteTodoList(id: string): Promise<boolean> {
    try {
      const data = await executeMutation(DELETE_TODO_LIST, { id });
      return data.todoListDelete?.success || false;
    } catch (error) {
      console.error('Error deleting todo list:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async getTodosByCategory(userId: string, category: string): Promise<TodoItem[]> {
    try {
      const filter = {
        assignedTo: { id: { equals: userId } },
        category: { equals: category }
      };
      const data = await executeQuery(GET_ALL_TODOS, { filter });
      return data.todoListsList?.items || [];
    } catch (error) {
      console.error('Error fetching todos by category:', error);
      throw error;
    }
  }

  async getTodosByStatus(userId: string, status: string): Promise<TodoItem[]> {
    try {
      const filter = {
        assignedTo: { id: { equals: userId } },
        status: { equals: status }
      };
      const data = await executeQuery(GET_ALL_TODOS, { filter });
      return data.todoListsList?.items || [];
    } catch (error) {
      console.error('Error fetching todos by status:', error);
      throw error;
    }
  }

  async getOverdueTodos(userId: string): Promise<TodoItem[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filter = {
        assignedTo: { id: { equals: userId } },
        dueDate: { lt: today },
        status: { in: ['pending', 'in_progress'] }
      };
      const data = await executeQuery(GET_ALL_TODOS, { filter });
      return data.todoListsList?.items || [];
    } catch (error) {
      console.error('Error fetching overdue todos:', error);
      throw error;
    }
  }

  async getUpcomingTodos(userId: string, daysAhead: number = 7): Promise<TodoItem[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const filter = {
        assignedTo: { id: { equals: userId } },
        dueDate: { gte: today, lte: futureDateString },
        status: { in: ['pending', 'in_progress'] }
      };
      const data = await executeQuery(GET_ALL_TODOS, { filter });
      return data.todoListsList?.items || [];
    } catch (error) {
      console.error('Error fetching upcoming todos:', error);
      throw error;
    }
  }

  // ============================================================================
  // REMINDER VALIDATION AND NOTIFICATION METHODS
  // ============================================================================

  private validateReminderInput(input: CreateReminderInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Reminder title is required');
    }

    if (!input.reminderDate) {
      throw new Error('Reminder date is required');
    }

    if (!input.reminderTime) {
      throw new Error('Reminder time is required');
    }

    // Validate date format and ensure it's not in the past
    const reminderDateTime = new Date(`${input.reminderDate}T${input.reminderTime}`);
    const now = new Date();
    
    if (reminderDateTime <= now) {
      throw new Error('Reminder date and time must be in the future');
    }

    // Validate recurring pattern if recurring is enabled
    if (input.isRecurring && !input.recurringPattern) {
      throw new Error('Recurring pattern is required when reminder is set to recurring');
    }

    // Validate title length
    if (input.title.length > 100) {
      throw new Error('Reminder title must be less than 100 characters');
    }

    // Validate description length
    if (input.description && input.description.length > 500) {
      throw new Error('Reminder description must be less than 500 characters');
    }
  }

  private async scheduleReminderNotification(reminder: Reminder): Promise<void> {
    try {
      const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
      const now = new Date();
      
      // Only schedule if the reminder is in the future
      if (reminderDateTime > now) {
        // In a real implementation, you would integrate with a job scheduler
        // For now, we'll use the existing notification system
        console.log(`Scheduling reminder notification for ${reminderDateTime.toISOString()}`);
        
        // You could integrate with your existing CRON job system here
        // or use a service like Bull Queue, Agenda.js, or similar
      }
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
      // Don't throw error here as the reminder was created successfully
    }
  }

  // Get reminders due for notification (for CRON job integration)
  async getRemindersDueForNotification(): Promise<Reminder[]> {
    try {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer
      
      // Use a simpler approach - get all active reminders and filter in memory
      // This avoids complex GraphQL date filtering
      const data = await executeQuery(GET_ALL_ACTIVE_REMINDERS, {});
      const allReminders = data.remindersList?.items || [];
      
      // Filter reminders that are due within the next 5 minutes
      const dueReminders = allReminders.filter((reminder: Reminder) => {
        // Handle both old time format and new DateTime format
        let reminderDateTime: Date;
        if (reminder.reminderTime.includes('T')) {
          // New DateTime format
          reminderDateTime = new Date(reminder.reminderTime);
        } else {
          // Old time format - combine with date
          reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
        }
        return reminderDateTime <= fiveMinutesFromNow && reminderDateTime > now;
      });
      
      return dueReminders;
    } catch (error) {
      console.error('Error fetching reminders due for notification:', error);
      return [];
    }
  }

  // Process recurring reminders (for CRON job integration)
  async processRecurringReminders(): Promise<void> {
    try {
      const recurringReminders = await this.getRecurringRemindersToProcess();
      
      for (const reminder of recurringReminders) {
        await this.createNextRecurringReminder(reminder);
      }
    } catch (error) {
      console.error('Error processing recurring reminders:', error);
    }
  }

  private async getRecurringRemindersToProcess(): Promise<Reminder[]> {
    try {
      const now = new Date();
      // Get all active reminders and filter for recurring ones that are due
      const data = await executeQuery(GET_ALL_ACTIVE_REMINDERS, {});
      const allReminders = data.remindersList?.items || [];
      
      // Filter for recurring reminders that are due
      const recurringDueReminders = allReminders.filter((reminder: Reminder) => {
        const reminderDateTime = new Date(`${reminder.reminderDate}T${reminder.reminderTime}`);
        return reminder.isRecurring && reminderDateTime <= now;
      });
      
      return recurringDueReminders;
    } catch (error) {
      console.error('Error fetching recurring reminders to process:', error);
      return [];
    }
  }

  private async createNextRecurringReminder(originalReminder: Reminder): Promise<void> {
    try {
      // Handle both old time format and new DateTime format
      let currentDateTime: Date;
      if (originalReminder.reminderTime.includes('T')) {
        // New DateTime format
        currentDateTime = new Date(originalReminder.reminderTime);
      } else {
        // Old time format - combine with date
        currentDateTime = new Date(`${originalReminder.reminderDate}T${originalReminder.reminderTime}`);
      }
      const nextDateTime = this.calculateNextRecurrence(currentDateTime, originalReminder.recurringPattern!);
      
      const nextReminderInput: CreateReminderInput = {
        title: originalReminder.title,
        description: originalReminder.description,
        reminderDate: nextDateTime.toISOString().split('T')[0],
        reminderTime: nextDateTime.toTimeString().split(' ')[0].substring(0, 5),
        isRecurring: true,
        recurringPattern: originalReminder.recurringPattern
      };

      await this.createReminder(nextReminderInput, originalReminder.userId);
      
      // Mark original reminder as completed or update its next occurrence
      await this.updateReminder(originalReminder.id, {
        reminderDate: nextDateTime.toISOString().split('T')[0],
        reminderTime: nextDateTime.toTimeString().split(' ')[0].substring(0, 5)
      });
    } catch (error) {
      console.error('Error creating next recurring reminder:', error);
    }
  }

  private calculateNextRecurrence(currentDateTime: Date, pattern: string): Date {
    const nextDateTime = new Date(currentDateTime);
    
    switch (pattern) {
      case 'daily':
        nextDateTime.setDate(nextDateTime.getDate() + 1);
        break;
      case 'weekly':
        nextDateTime.setDate(nextDateTime.getDate() + 7);
        break;
      case 'monthly':
        nextDateTime.setMonth(nextDateTime.getMonth() + 1);
        break;
      case 'yearly':
        nextDateTime.setFullYear(nextDateTime.getFullYear() + 1);
        break;
      default:
        nextDateTime.setDate(nextDateTime.getDate() + 1); // Default to daily
    }
    
    return nextDateTime;
  }

  // Get todo statistics for dashboard (optimized to use single query)
  async getTodoStatistics(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
  }> {
    try {
      // Get all todos in a single query
      const allTodos = await this.getTodosByUser(userId);
      
      const today = new Date().toISOString().split('T')[0];
      const todayDate = new Date(today);
      const weekFromNow = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekFromNowString = weekFromNow.toISOString().split('T')[0];

      // Calculate statistics from the single query result
      const statistics = {
        total: allTodos.length,
        pending: allTodos.filter(todo => todo.status === 'pending').length,
        inProgress: allTodos.filter(todo => todo.status === 'in_progress').length,
        completed: allTodos.filter(todo => todo.status === 'completed').length,
        overdue: allTodos.filter(todo => {
          if (!todo.dueDate) return false;
          return new Date(todo.dueDate) < todayDate && ['pending', 'in_progress'].includes(todo.status);
        }).length,
        dueToday: allTodos.filter(todo => todo.dueDate === today && ['pending', 'in_progress'].includes(todo.status)).length,
        dueThisWeek: allTodos.filter(todo => {
          if (!todo.dueDate) return false;
          const dueDate = new Date(todo.dueDate);
          return dueDate >= todayDate && dueDate <= weekFromNow && ['pending', 'in_progress'].includes(todo.status);
        }).length
      };

      console.log('Calculated statistics from single query:', statistics);
      return statistics;
    } catch (error) {
      console.error('Error getting todo statistics:', error);
      throw error;
    }
  }
}

export const todoService = new TodoService();

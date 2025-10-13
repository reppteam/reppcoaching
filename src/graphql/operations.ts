import { gql } from '@apollo/client';

// ============================================================================
// USER CREATION OPERATIONS (for 8baseService)
// ============================================================================

export const CREATE_USER_WITH_ROLES_OPERATION = gql`
  mutation CreateUserWithRolesOperation($data: UserCreateInput!) {
    userCreate(data: $data) {
      id
      email
      firstName
      lastName
      roles {
        items {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_USER_SIMPLE = gql`
  mutation CreateUserSimple($data: UserCreateInput!) {
    userCreate(data: $data) {
      id
      email
      firstName
      lastName
      createdAt
      updatedAt
    }
  }
`;

export const ASSIGN_ROLE_TO_USER_BY_FILTER = gql`
  mutation AssignRoleToUserByFilter($userId: ID!, $roleId: ID!) {
    userUpdate(
      filter: { id: $userId }
      data: {
        roles: {
          connect: [{ id: $roleId }]
        }
      }
    ) {
      id
      email
      firstName
      lastName
      roles {
        items {
          id
          name
        }
      }
      updatedAt
    }
  }
`;

export const CREATE_COACH = gql`
  mutation CreateCoach($data: CoachCreateInput!) {
    coachCreate(data: $data) {
      id
      firstName
      lastName
      email
      bio
      profileImage {
        downloadUrl
      }
      users {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COACH = gql`
  mutation UpdateCoach($id: ID!, $data: CoachUpdateInput!) {
    coachUpdate(filter: { id: $id }, data: $data) {
      id
      firstName
      lastName
      email
      bio
      profileImage {
        downloadUrl
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COACH_BY_USER_ID = gql`
  mutation UpdateCoachByUserId($userId: ID!, $data: CoachUpdateInput!) {
    coachUpdate(filter: { users: { id: { equals: $userId } } }, data: $data) {
      id
      firstName
      lastName
      email
      bio
      profileImage {
        downloadUrl
      }
      users {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_STUDENT_BY_USER_ID = gql`
  query GetStudentByUserId($userId: ID!) {
    studentsList(filter: { user: { id: { equals: $userId } } }) {
      items {
        id
        firstName
        lastName
        email
        phone
        business_name
        location
        target_market
        strengths
        challenges
        goals
        preferred_contact_method
        availability
        notes
        user {
          id
          firstName
          lastName
          email
        }
        createdAt
        updatedAt
        __typename
      }
    }
  }
`;

export const GET_STUDENT_BY_EMAIL = gql`
  query GetStudentByEmail($email: String!) {
    studentsList(filter: { email: { equals: $email } }) {
      items {
        id
        firstName
        lastName
        email
        phone
        business_name
        location
        target_market
        strengths
        challenges
        goals
        preferred_contact_method
        availability
        notes
        user {
          id
          firstName
          lastName
          email
        }
        coach {
          id
          firstName
          lastName
          email
          bio
          user {
            id
            firstName
            lastName
            email
          }
        }
        createdAt
        updatedAt
        __typename
      }
    }
  }
`;

export const GET_ALL_STUDENTS = gql`
  query GetAllStudents {
    studentsList {
      items {
        id
        firstName
        lastName
        email
        phone
        business_name
        location
        target_market
        strengths
        challenges
        goals
        preferred_contact_method
        availability
        notes
        access_start
        access_end
        coaching_term_start
        coaching_term_end
        average_order_value
        current_goal
        engagement_score
        goal_progress
        last_report_date
        next_milestone
        total_editing_cost
        total_expenses
        total_revenue
        total_shoots
        user {
          id
          firstName
          lastName
          email
          coaching_term_start
          coaching_term_end
          access_start
          access_end
          has_paid
          is_active
          createdAt
          updatedAt
        }
        coach {
          id
          firstName
          lastName
          email
          bio
          users {
            id
            firstName
            lastName
            email
          }
        }
        createdAt
        updatedAt
        __typename
      }
    }
  }
`;


export const UPDATE_STUDENT_BY_USER_ID = gql`
  mutation UpdateStudentByUserId($userId: ID!, $data: StudentUpdateInput!) {
    studentUpdateByFilter(
      filter: { user: { id: { equals: $userId } } }
      data: $data
    ) {
      id
      firstName
      lastName
      email
      phone
      business_name
      location
      target_market
      strengths
      challenges
      goals
      preferred_contact_method
      availability
      notes
      user {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const UPDATE_STUDENT_BY_EMAIL = gql`
  mutation UpdateStudentByEmail($email: String!, $data: StudentUpdateInput!) {
    studentUpdateByFilter(
      filter: { email: { equals: $email } }
      data: $data
    ) {
      id
      firstName
      lastName
      email
      phone
      business_name
      location
      target_market
      strengths
      challenges
      goals
      preferred_contact_method
      availability
      notes
      user {
        id
        firstName
        lastName
        email
      }
      coach {
        id
        firstName
        lastName
        email
        bio
        user {
          id
          firstName
          lastName
          email
        }
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const UPDATE_STUDENT_AND_ASSIGN_COACH_BY_EMAIL = gql`
  mutation UpdateStudentAndAssignCoachByEmail($email: String!, $firstName: String, $lastName: String, $phone: String, $business_name: String, $location: String, $target_market: String, $strengths: String, $challenges: String, $goals: String, $preferred_contact_method: String, $availability: String, $notes: String, $coachEmail: String!) {
    studentUpdateByFilter(
      filter: { email: { equals: $email } }
      data: {
        firstName: $firstName
        lastName: $lastName
        phone: $phone
        business_name: $business_name
        location: $location
        target_market: $target_market
        strengths: $strengths
        challenges: $challenges
        goals: $goals
        preferred_contact_method: $preferred_contact_method
        availability: $availability
        notes: $notes
        coach: {
          connect: { user: { email: { equals: $coachEmail } } }
        }
      }
    ) {
      id
      firstName
      lastName
      email
      phone
      business_name
      location
      target_market
      strengths
      challenges
      goals
      preferred_contact_method
      availability
      notes
      user {
        id
        firstName
        lastName
        email
      }
      coach {
        id
        firstName
        lastName
        email
        bio
        user {
          id
          firstName
          lastName
          email
        }
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const ASSIGN_COACH_TO_STUDENT = gql`
  mutation AssignCoachToStudent($studentUserId: ID!, $coachUserId: ID!) {
    # Update the Student record to assign the coach
    studentUpdateByFilter(
      filter: { user: { id: { equals: $studentUserId } } }
      data: {
        coach: {
          connect: { user: { id: { equals: $coachUserId } } }
        }
      }
    ) {
      id
      firstName
      lastName
      email
      phone
      business_name
      coach {
        id
        firstName
        lastName
        email
        bio
        user {
          id
          firstName
          lastName
          email
        }
      }
      user {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const DISCONNECT_COACH_FROM_STUDENT = gql`
  mutation DisconnectCoachFromStudent($studentId: ID!, $coachId: ID!) {
    __typename
    studentUpdate(
      filter: { id: $studentId }
      data: {
        coach: {
          disconnect: { id: $coachId }
        }
      }
    ) {
      coach {
        firstName
        id
        lastName
        email
        bio
        users {
          email
          id
          firstName
          lastName
        }
      }
      id
      lastName
      firstName
      email
      phone
      business_name
    }
  }
`;

export const CREATE_STUDENT = gql`
  mutation CreateStudent($data: StudentCreateInput!) {
    studentCreate(data: $data) {
      id
      firstName
      lastName
      email
      phone
      business_name
      location
      target_market
      strengths
      challenges
      goals
      preferred_contact_method
      availability
      notes
      user {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_STUDENT_RECORD = gql`
  mutation DeleteStudentRecord($id: ID!) {
    studentDestroy(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// USER UPDATE WITH COACH CONNECTION
// ============================================================================

export const UPDATE_USER_WITH_COACH_CONNECTION = gql`
  mutation UsersUpdate($data: UserUpdateInput!, $filter: UserKeyFilter) {
    userUpdate(data: $data, filter: $filter) {
      id
      email
      status
      firstName
      lastName
      timezone
      avatar {
        id
        fileId
        filename
        downloadUrl
        shareUrl
        meta
        public
        __typename
      }
      roles {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      phoneNumber
      coach {
        id
        _description
        __typename
      }
      weeklyReportBId {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      session {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      productAId {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      pricingAId {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      
      leadAId {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      goalAId {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      globalVariable {
        id
        _description
        __typename
      }
      assignmentStudent {
        id
        _description
        __typename
      }
      student {
        id
        _description
        __typename
      }
      assigned_admin_id
      access_start
      access_end
      has_paid
      is_active
      _description
      __typename
    }
  }
`;

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const GET_ROLES_LIST = gql`
  query GetRolesList {
    rolesList {
      items {
        id
        name
        description
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    usersList {
    items {
      access_end
      access_start
      assigned_admin_id
      createdAt
      email
      firstName
      id
      lastName
      student {
        email
        firstName
        lastName
        id
        notes
        phone
        preferred_contact_method
        goals
        business_name
        availability
        challenges
        strengths
      }
      avatar {
        id
        public
        downloadUrl
      }
      coach {
        firstName
        lastName
        id
        email
      }
      is_active
      phoneNumber
      roles {
        items {
          id
          name
        }
      }
      updatedAt
      timezone
    }
  }
  }
`;

export const GET_USERS_SIMPLE = gql`
  query GetUsersSimple {
    __typename
    usersList {
      items {
        access_end
        access_start
        assigned_admin_id
        createdAt
        email
        firstName
        id
        lastName
        student {
          email
          firstName
          lastName
          id
          notes
          phone
          preferred_contact_method
          goals
          business_name
          availability
          challenges
          strengths
        }
        avatar {
          id
          public
          downloadUrl
        }
        coach {
          firstName
          lastName
          id
          email
        }
        is_active
        phoneNumber
        roles {
          items {
            id
            name
          }
        }
        updatedAt
        timezone
      }
    }
  }
`;

export const GET_USER_BY_FILTER = gql`
  query GetUserByFilter($filter: UserFilter) {
    usersList(filter: $filter) {
      items {
        id
        email
        firstName
        lastName
        status
        origin
        timezone
        createdAt
        updatedAt
        avatar {
          downloadUrl
        }
        roles {
          items {
            id
            name
          }
        }
        student {
          id
          firstName
          lastName
          email
          phone
          business_name
          location
          target_market
          strengths
          challenges
          goals
          preferred_contact_method
          availability
          notes
          updatedAt
          coach {
            id
            firstName
            lastName
            email
            bio
          }
        }
        coach {
          id
          firstName
          lastName
          email
          bio
          profileImage {
            downloadUrl
          }
          students {
            id
            firstName
            lastName
            email
            phone
            business_name
          }
        }
      }
    }
  }
`;


export const UPDATE_USER = gql`
  mutation UpdateUser($data: UserUpdateInput!, $filter: UserKeyFilter) {
    userUpdate(data: $data, filter: $filter) {
      id
      email
      status
      firstName
      lastName
      timezone
      avatar {
        id
        fileId
        filename
        downloadUrl
        shareUrl
        meta
        public
        __typename
      }
      roles {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      phoneNumber
      student {
        id
        firstName
        lastName
        email
        phone
        business_name
        location
        target_market
        strengths
        challenges
        goals
        preferred_contact_method
        availability
        notes
        coach {
          id
          firstName
          lastName
          email
          bio
        }
      }
      coach {
        id
        firstName
        lastName
        email
        bio
        profileImage {
          downloadUrl
        }
        students {
          id
          firstName
          lastName
          email
          phone
          business_name
        }
      }
      assigned_admin_id
      access_start
      access_end
      has_paid
      is_active
      _description
      __typename
    }
  }
`;

// Simple update query for basic user fields only
export const UPDATE_USER_SIMPLE = gql`
  mutation UpdateUserSimple($data: UserUpdateInput!, $filter: UserKeyFilter) {
    __typename
    userUpdate(data: $data, filter: $filter) {
      id
      email
      firstName
      lastName
      is_active
      has_paid
      createdAt
      updatedAt
      roles {
        items {
          id
          name
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const UPDATE_USER_WITH_COACH = gql`
  mutation UpdateUserWithCoach($data: UserUpdateInput!, $filter: UserKeyFilter) {
    userUpdate(data: $data, filter: $filter) {
      id
      email
      status
      firstName
      lastName
      timezone
      avatar {
        id
        fileId
        filename
        downloadUrl
        shareUrl
        meta
        public
        __typename
      }
      roles {
        items {
          id
          _description
          __typename
        }
        count
        __typename
      }
      phoneNumber
      student {
        id
        firstName
        lastName
        email
        phone
        business_name
        location
        target_market
        strengths
        challenges
        goals
        preferred_contact_method
        availability
        notes
      }
      coach {
        id
        firstName
        lastName
        email
        bio
        profileImage {
          downloadUrl
        }
        student {
          id
          firstName
          lastName
          email
          phone
          business_name
        }
      }
      assigned_admin_id
      access_start
      access_end
      has_paid
      is_active
      _description
      __typename
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    userDelete(data: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// COACH OPERATIONS
// ============================================================================

export const GET_ALL_COACHES = gql`
  query GetAllCoaches {
    usersList(filter: { roles: { some: { name: { equals: "Coach" } } } }) {
      items {
        id
        firstName
        lastName
        email
        status
        origin
        timezone
        createdAt
        updatedAt
        roles {
          items {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_ALL_COACHES_WITH_COACH_TABLE_IDS = gql`
  query GetAllCoachesWithCoachTableIds {
    usersList(filter: { roles: { some: { name: { equals: "Coach" } } } }) {
      items {
        id
        firstName
        lastName
        email
        status
        origin
        timezone
        createdAt
        updatedAt
        roles {
          items {
            id
            name
          }
        }
        coach {
          id
          _description
          __typename
        }
      }
    }
  }
`;

export const GET_COACH_BY_USER_ID = gql`
  query GetCoachByUserId($userId: ID!) {
    coachesList(filter: { users: { id: { equals: $userId } } }) {
      items {
        id
        firstName
        lastName
        email
        bio
        users {
          id
          firstName
          lastName
          email
        }
        createdAt
        updatedAt
        __typename
      }
    }
  }
`;

export const GET_ALL_COACHES_DIRECT = gql`
  query GetAllCoachesDirect {
    coachesList {
      items {
        id
        firstName
        lastName
        email
        bio
        createdAt
        updatedAt
        users {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const GET_COACH_BY_EMAIL = gql`
  query GetCoachByEmail($email: String!) {
    coachesList(filter: { email: { equals: $email } }) {
      items {
        id
        firstName
        lastName
        email
        bio
        profileImage {
          downloadUrl
        }
        users {
          id
          firstName
          lastName
          email
          status
          roles {
            items {
              id
              name
            }
          }
        }
        createdAt
        updatedAt
        __typename
      }
    }
  }
`;

export const GET_COACH_WITH_STUDENTS = gql`
  query GetCoachWithStudents($coachId: ID!) {
    coachesList(filter: { id: { equals: $coachId } }) {
      items {
        id
        firstName
        lastName
        email
        bio
        profileImage {
          downloadUrl
        }
        user {
          id
          firstName
          lastName
          email
          status
          roles {
            items {
              id
              name
            }
          }
        }
        users {
          id
          firstName
          lastName
          email
          status
          roles {
            items {
              id
              name
            }
          }
        }
        students {
          id
          firstName
          lastName
          email
          phone
          business_name
          location
          target_market
          strengths
          challenges
          goals
          preferred_contact_method
          availability
          notes
          user {
            id
            firstName
            lastName
            email
          }
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        __typename
      }
    }
  }
`;

export const DELETE_COACH = gql`
  mutation DeleteCoach($filter: CoachFilter!) {
    coachesDestroyByFilter(filter: $filter) {
      success
    }
  }
`;

export const DELETE_COACH_BY_ID = gql`
  mutation DeleteCoachById($id: ID!) {
    coachDestroy(filter: { id: $id }) {
      success
    }
  }
`;

// New queries as requested
export const GET_COACHES_BY_EMAIL_FILTER = gql`
  query GetCoachesByEmailFilter($email: String!) {
    coachesList(filter: { email: { contains: $email } }) {
      items {
        _description
        bio
        createdAt
        deletedAt
        email
        firstName
        id
        lastName
      }
    }
  }
`;

export const GET_COACH_WITH_STUDENTS_AND_REPORTS = gql`
  query GetCoachWithStudentsAndReports($id: ID!) {
    coach(id: $id) {
      id
      bio
      email
      firstName
      lastName
      students {
        items {
          availability
          business_name
          challenges
          createdAt
          deletedAt
          email
          firstName
          goals
          id
          lastName
          location
          notes
          phone
          preferred_contact_method
          strengths
          target_market
          updatedAt
          student {
            items {
              id
              free_shoots
              expenses
              end_date
              editing_cost
              createdAt
              aov
              net_profit
              new_clients
              paid_shoots
              revenue
              start_date
              status
              unique_clients
              updatedAt
            }
          }
        }
      }
    }
  }
`;

export const GET_STUDENT_BY_ID = gql`
  query GetStudentById($id: ID!) {
    student(id: $id) {
      id
      firstName
      lastName
      email
      phone
      business_name
      location
      target_market
      strengths
      challenges
      goals
      preferred_contact_method
      availability
      notes
      user {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
      student {
        items {
          id
          free_shoots
          expenses
          end_date
          editing_cost
          createdAt
          aov
          net_profit
          new_clients
          paid_shoots
          revenue
          start_date
          status
          unique_clients
          updatedAt
        }
      }
    }
  }
`;

export const GET_USER_WITH_STUDENT_PROFILE = gql`
  query GetUserWithStudentProfile($userId: ID!) {
    usersList(
      filter: {
        id: {
          equals: $userId
        }
      }
    ) {
      items {
        id
        email
        firstName
        lastName
        status
        createdAt
        updatedAt
        student {
          id
          firstName
          lastName
          email
          phone
          business_name
          location
          target_market
          strengths
          challenges
          goals
          preferred_contact_method
          availability
          notes
          updatedAt
          coach {
            id
            firstName
            lastName
            email
            bio
          }
        }
      }
    }
  }
`;

// ============================================================================
// STUDENT PROFILE OPERATIONS
// ============================================================================

export const GET_STUDENT_PROFILE_BY_FILTER = gql`
  query GetStudentProfileByFilter($filter: UserFilter!) {
    usersList(filter: $filter) {
      items {
        id
        email
        firstName
        lastName
        status
        createdAt
        updatedAt
        student {
          id
          firstName
          lastName
          email
          phone
          business_name
          location
          target_market
          strengths
          challenges
          goals
          preferred_contact_method
          availability
          updatedAt
          coach {
            id
            firstName
            lastName
            email
            bio
          }
        }
      }
    }
  }
`;

export const UPDATE_STUDENT_PROFILE = gql`
  mutation UpdateStudentProfile($id: ID!, $data: StudentUpdateInput!) {
    studentUpdate(filter: { id: $id }, data: $data) {
      id
      firstName
      lastName
      email
      phone
      business_name
      location
      target_market
      strengths
      challenges
      goals
      preferred_contact_method
      availability
      notes
      access_start
      access_end
      coaching_term_start
      coaching_term_end
      average_order_value
      current_goal
      engagement_score
      goal_progress
      last_report_date
      next_milestone
      total_editing_cost
      total_expenses
      total_revenue
      total_shoots
      has_paid
      is_active
      coach {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_STUDENT_PROFILE = gql`
  mutation CreateStudentProfile($data: StudentCreateInput!) {
    studentCreate(data: $data) {
      id
      firstName
      lastName
      email
      phone
      business_name
      location
      target_market
      strengths
      challenges
      goals
      preferred_contact_method
      availability
      notes
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// WEEKLY REPORT OPERATIONS
// ============================================================================

export const GET_WEEKLY_REPORTS_BY_FILTER = gql`
  query GetWeeklyReportsByFilter($filter: WeeklyReportFilter) {
    weeklyReportsList(filter: $filter) {
      items {
        id
        start_date
        end_date
        new_clients
        paid_shoots
        free_shoots
        unique_clients
        aov
        revenue
        expenses
        editing_cost
        net_profit
        status
        createdBy {
          id
          firstName
          lastName
          email
        }
        student {
          id
          firstName
          lastName
          email
        }
        weekly_Report {
          id
          firstName
          lastName
          email
        }
        _description
        __typename
      }
    }
  }
`;

export const CREATE_WEEKLY_REPORT = gql`
  mutation CreateWeeklyReport($data: WeeklyReportCreateInput!) {
    weeklyReportCreate(data: $data) {
      id
      start_date
      end_date
      new_clients
      paid_shoots
      free_shoots
      unique_clients
      aov
      revenue
      expenses
      editing_cost
      net_profit
      status
      weekly_Report {
        id
        _description
        __typename
      }
      student {
        id
        _description
        __typename
      }
      _description
      __typename
    }
  }
`;

export const UPDATE_WEEKLY_REPORT = gql`
  mutation UpdateWeeklyReport($filter: WeeklyReportFilter!, $data: WeeklyReportUpdateByFilterInput!) {
    weeklyReportUpdateByFilter(filter: $filter, data: $data) {
      items {
        id
        start_date
        end_date
        new_clients
        paid_shoots
        free_shoots
        unique_clients
        aov
        revenue
        expenses
        editing_cost
        net_profit
        status
        weekly_Report {
          id
          _description
          __typename
        }
        student {
          id
          _description
          __typename
        }
        _description
        __typename
      }
    }
  }
`;

export const UPDATE_WEEKLY_REPORT_BY_ID = gql`
  mutation UpdateWeeklyReportById($id: ID!, $data: WeeklyReportUpdateInput!) {
    weeklyReportUpdate(filter: { id: { equals: $id } }, data: $data) {
      id
      start_date
      end_date
      new_clients
      paid_shoots
      free_shoots
      unique_clients
      aov
      revenue
      expenses
      editing_cost
      net_profit
      status
      weekly_Report {
        id
        _description
        __typename
      }
      student {
        id
        _description
        __typename
      }
      _description
      __typename
    }
  }
`;

export const UPDATE_WEEKLY_REPORT_SIMPLE = gql`
  mutation UpdateWeeklyReportSimple($id: ID!, $data: WeeklyReportUpdateInput!) {
    weeklyReportUpdate(filter: { id: $id }, data: $data) {
      id
      start_date
      end_date
      new_clients
      paid_shoots
      free_shoots
      unique_clients
      aov
      revenue
      expenses
      editing_cost
      net_profit
      status
      weekly_Report {
        id
        _description
        __typename
      }
      student {
        id
        _description
        __typename
      }
      _description
      __typename
    }
  }
`;

export const UPDATE_WEEKLY_REPORT_BY_ID_ONLY = gql`
  mutation UpdateWeeklyReportByIdOnly($id: ID!, $data: WeeklyReportUpdateInput!) {
    weeklyReportUpdate(filter: { id: $id }, data: $data) {
      id
      start_date
      end_date
      new_clients
      paid_shoots
      free_shoots
      unique_clients
      aov
      revenue
      expenses
      editing_cost
      net_profit
      status
      weekly_Report {
        id
        _description
        __typename
      }
      student {
        id
        _description
        __typename
      }
      _description
      __typename
    }
  }
`;

export const UPDATE_WEEKLY_REPORT_DIRECT = gql`
  mutation UpdateWeeklyReportDirect($id: ID!, $data: WeeklyReportUpdateInput!) {
    weeklyReportUpdate(filter: { id: { equals: $id } }, data: $data) {
      id
      start_date
      end_date
      new_clients
      paid_shoots
      free_shoots
      unique_clients
      aov
      revenue
      expenses
      editing_cost
      net_profit
      status
      weekly_Report {
        id
        _description
        __typename
      }
      student {
        id
        _description
        __typename
      }
      _description
      __typename
    }
  }
`;

export const DELETE_WEEKLY_REPORT = gql`
  mutation DeleteWeeklyReport($id: ID!) {
    weeklyReportDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// GOAL OPERATIONS
// ============================================================================

export const GET_GOALS_BY_FILTER = gql`
  query GetGoalsByFilter($filter: GoalFilter) {
    goalsList(filter: $filter) {
      items {
        id
        title
        description
        target_value
        current_value
        goal_type
        deadline
        priority
        status
        month_start
        low_goal_shoots
        success_goal_shoots
        actual_shoots
        low_goal_revenue
        success_goal_revenue
        actual_revenue
        aov
        student {
          id
          _description
          __typename
        }
       
        _description
        __typename
      }
    }
  }
`;

export const CREATE_GOAL = gql`
  mutation CreateGoal($data: GoalCreateInput!) {
    goalCreate(data: $data) {
      id
      title
      description
      target_value
      current_value
      goal_type
      deadline
      priority
      status
      month_start
      low_goal_shoots
      success_goal_shoots
      actual_shoots
      low_goal_revenue
      success_goal_revenue
      actual_revenue
      aov
      student {
        id
        _description
        __typename
      }
      goal {
        id
        _description
        __typename
      }
      _description
      __typename
    }
  }
`;

export const UPDATE_GOAL = gql`
  mutation UpdateGoal($filter: GoalFilter!, $data: GoalUpdateByFilterInput!) {
    goalUpdateByFilter(filter: $filter, data: $data) {
      items {
        id
        title
        description
        target_value
        current_value
        goal_type
        deadline
        priority
        status
        month_start
        low_goal_shoots
        success_goal_shoots
        actual_shoots
        low_goal_revenue
        success_goal_revenue
        actual_revenue
        aov
        student {
          id
          _description
          __typename
        }
        goal {
          id
          _description
          __typename
        }
        _description
        __typename
      }
    }
  }
`;

export const UPDATE_GOAL_BY_ID = gql`
  mutation UpdateGoalById($id: ID!, $data: GoalUpdateInput!) {
    goalUpdate(filter: { id: { equals: $id } }, data: $data) {
      id
      title
      description
      target_value
      current_value
      goal_type
      deadline
      priority
      status
      month_start
      low_goal_shoots
      success_goal_shoots
      actual_shoots
      low_goal_revenue
      success_goal_revenue
      actual_revenue
      aov
      student {
        id
        _description
        __typename
      }
      goal {
        id
        _description
        __typename
      }
      _description
      __typename
    }
  }
`;

export const UPDATE_GOAL_SIMPLE = gql`
  mutation UpdateGoalSimple($id: ID!, $data: GoalUpdateInput!) {
    goalUpdate(filter: { id: $id }, data: $data) {
      id
      title
      description
      target_value
      current_value
      goal_type
      deadline
      priority
      status
      month_start
      low_goal_shoots
      success_goal_shoots
      actual_shoots
      low_goal_revenue
      success_goal_revenue
      actual_revenue
      aov
      _description
      __typename
    }
  }
`;

export const DELETE_GOAL = gql`
  mutation DeleteGoal($data: GoalDeleteInput!) {
    goalsDelete(data: $data) {
      success
    }
  }
`;

// ============================================================================
// PRICING OPERATIONS
// ============================================================================

export const GET_PRICING_BY_FILTER = gql`
  query GetPricingByFilter($filter: PricingFilter) {
    pricingsList(filter: $filter) {
      items {
        id
        service_name
        your_price
        competitor_price
        estimated_cost
        estimated_profit
        status
        student {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_PRICING = gql`
  mutation CreatePricing($data: PricingCreateInput!) {
    pricingsCreate(data: $data) {
      id
      service_name
      your_price
      competitor_price
      estimated_cost
      estimated_profit
      status
      student {
        id
        email
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRICING = gql`
  mutation UpdatePricing($id: ID!, $data: PricingUpdateInput!) {
    pricingsUpdate(filter: { id: $id }, data: $data) {
      id
      service_name
      your_price
      competitor_price
      estimated_cost
      estimated_profit
      status
      student {
        id
        email
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PRICING = gql`
  mutation DeletePricing($id: ID!) {
    pricingsDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// COACH PRICING OPERATIONS
// ============================================================================

export const GET_COACH_PRICING_BY_FILTER = gql`
  query GetCoachPricingByFilter($filter: PricingFilter) {
    pricingsList(filter: $filter) {
      items {
        id
        name
        description
        price
        duration_weeks
        category
        package_Features
        status
        user {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_COACH_PRICING = gql`
  mutation CreateCoachPricing($data: PricingCreateInput!) {
    pricingsCreate(data: $data) {
      success
    }
  }
`;

export const UPDATE_COACH_PRICING = gql`
  mutation UpdateCoachPricing($filter: PricingFilter!, $data: PricingUpdateByFilterInput!) {
    pricingsUpdateByFilter(filter: $filter, data: $data) {
      items {
        id
        name
        description
        price
        duration_weeks
        category
        package_Features
        status
        user {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_COACH_PRICING = gql`
  mutation DeleteCoachPricing($filter: PricingFilter!) {
    pricingsDestroyByFilter(filter: $filter) {
      success
    }
  }
`;

// ============================================================================
// LEAD OPERATIONS
// ============================================================================

export const GET_LEADS_BY_FILTER = gql`
  query GetLeadsByFilter($filter: LeadFilter) {
    leadsList(filter: $filter) {
      items {
        id
        lead_name
        email
        phone
        instagram_handle
        lead_source
        initial_call_outcome
        date_of_initial_call
        last_followup_outcome
        date_of_last_followup
        next_followup_date
        status
        user {
          id
          email
          firstName
          lastName
        }
        engagement_statuses
        script_components
        engagementTag {
          items {
            id
            type
            completed_date
          }
        }
        scriptComponents {
          items {
            id
            intro
            hook
            body1
            body2
            ending
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_STUDENT_LEADS = gql`
  query GetStudentLeads($userId: ID!) {
    leadsList(filter: { user: { id: { equals: $userId } } }) {
      items {
        id
        lead_name
        email
        phone
        instagram_handle
        lead_source
        initial_call_outcome
        date_of_initial_call
        last_followup_outcome
        date_of_last_followup
        next_followup_date
        status
        user {
          id
          email
          firstName
          lastName
        }
        engagementTag {
          items {
            id
            type
            completed_date
          }
        }
        scriptComponents {
          items {
            id
            intro
            hook
            body1
            body2
            ending
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_LEAD = gql`
  mutation CreateLead($data: LeadCreateInput!) {
    leadCreate(data: $data) {
      id
      lead_name
      email
      phone
      instagram_handle
      lead_source
      initial_call_outcome
      date_of_initial_call
      last_followup_outcome
      date_of_last_followup
      next_followup_date
      status
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_LEADS_BULK = gql`
  mutation CreateLeadsBulk($data: [LeadCreateManyInput!]!) {
    leadCreateMany(data: $data) {
      items {
        id
        lead_name
        email
        phone
        instagram_handle
        lead_source
        initial_call_outcome
        date_of_initial_call
        last_followup_outcome
        date_of_last_followup
        next_followup_date
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_LEAD = gql`
  mutation UpdateLead($filter: LeadFilter!, $data: LeadUpdateByFilterInput!) {
    leadUpdateByFilter(filter: $filter, data: $data) {
      items {
        id
        lead_name
        email
        phone
        instagram_handle
        lead_source
        initial_call_outcome
        date_of_initial_call
        last_followup_outcome
        date_of_last_followup
        next_followup_date
        status
        user {
          id
          email
          firstName
          lastName
        }
        scriptComponents {
          items {
            id
            intro
            hook
            body1
            body2
            ending
            createdAt
            updatedAt
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_LEAD_SIMPLE = gql`
  mutation UpdateLeadSimple($id: ID!, $data: LeadUpdateInput!) {
    leadUpdate(filter: { id: $id }, data: $data) {
      id
      lead_name
      email
      phone
      instagram_handle
      lead_source
      initial_call_outcome
      date_of_initial_call
      last_followup_outcome
      date_of_last_followup
      next_followup_date
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LEAD_BY_FILTER = gql`
  mutation UpdateLeadByFilter($filter: LeadFilter!, $data: LeadUpdateByFilterInput!) {
    leadUpdateByFilter(filter: $filter, data: $data) {
      items {
        id
        lead_name
        email
        phone
        instagram_handle
        lead_source
        initial_call_outcome
        date_of_initial_call
        last_followup_outcome
        date_of_last_followup
        next_followup_date
        status
        user {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_LEAD = gql`
  mutation DeleteLead($id: ID!) {
    leadDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// ENGAGEMENT TAG OPERATIONS
// ============================================================================

export const CREATE_ENGAGEMENT_TAG = gql`
  mutation CreateEngagementTag($data: EngagementTagCreateInput!) {
    engagementTagCreate(data: $data) {
      id
      type
      completed_date
      lead {
        id
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ENGAGEMENT_TAG = gql`
  mutation UpdateEngagementTag($id: ID!, $data: EngagementTagUpdateInput!) {
    engagementTagUpdate(filter: { id: $id }, data: $data) {
      id
      type
      completed_date
      lead {
        id
        lead_name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_ENGAGEMENT_TAG = gql`
  mutation DeleteEngagementTag($id: ID!) {
    engagementTagDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// SCRIPT COMPONENTS OPERATIONS
// ============================================================================

export const CREATE_SCRIPT_COMPONENTS = gql`
  mutation CreateScriptComponents($data: ScriptComponentCreateInput!) {
    scriptComponentCreate(data: $data) {
      id
      intro
      hook
      body1
      body2
      ending
      lead {
        id
        lead_name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SCRIPT_COMPONENTS = gql`
  mutation UpdateScriptComponents($id: ID!, $data: ScriptComponentUpdateInput!) {
    scriptComponentUpdate(filter: { id: $id }, data: $data) {
      id
      intro
      hook
      body1
      body2
      ending
      lead {
        id
        lead_name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SCRIPT_COMPONENTS = gql`
  mutation DeleteScriptComponents($id: ID!) {
    scriptComponentDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// CALL LOG OPERATIONS
// ============================================================================

export const GET_CALL_LOGS_BY_FILTER = gql`
  query GetCallLogsByFilter($filter: CallLogFilter) {
    callLogsList(filter: $filter) {
      items {
        id
        call_date
        call_duration
        call_type
        topics_discussed
        outcome
        next_steps
        student_mood
        recording_url
        student {
          id
          email
          firstName
          lastName
        }
        coach {
          id
          email
          firstName
          lastName
          bio
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_CALL_LOG = gql`
  mutation CreateCallLog($data: CallLogCreateInput!) {
    callLogCreate(data: $data) {
      id
      call_date
      call_duration
      call_type
      topics_discussed
      outcome
      next_steps
      student_mood
      recording_url
      student {
        id
        email
        firstName
        lastName
      }
      coach {
        id
        email
        firstName
        lastName
        bio
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CALL_LOG = gql`
  mutation UpdateCallLog($id: ID!, $data: CallLogUpdateInput!) {
    callLogUpdate(filter: { id: $id }, data: $data) {
      id
      call_date
      call_duration
      call_type
      topics_discussed
      outcome
      next_steps
      student_mood
      recording_url
      student {
        id
        email
        firstName
        lastName
      }
      coach {
        id
        email
        firstName
        lastName
        bio
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CALL_LOG = gql`
  mutation DeleteCallLog($id: ID!) {
    callLogDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// NOTE OPERATIONS
// ============================================================================

export const GET_NOTES_BY_FILTER = gql`
  query GetNotesByFilter($filter: NoteFilter) {
    notesList(filter: $filter) {
      items {
        id
        title
        content
        target_type
        visibility
        createdAt
        updatedAt
        studentNote {
          id
          firstName
          lastName
          email
          user {
            id
            email
            firstName
            lastName
          }
        }
        coach {
          id
          firstName
          lastName
          email
          users {
            id
            email
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation CreateNote($data: NoteCreateInput!) {
    noteCreate(data: $data) {
      id
      title
      content
      target_type
      visibility
      createdAt
      updatedAt
      studentNote {
        id
        firstName
        lastName
        email
        user {
          id
          email
          firstName
          lastName
        }
      }
      coach {
        id
        firstName
        lastName
        email
        users {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation UpdateNote($id: ID!, $data: NoteUpdateInput!) {
    noteUpdate(filter: { id: $id }, data: $data) {
      id
      title
      content
      target_type
      visibility
      createdAt
      updatedAt
      studentNote {
        id
        firstName
        lastName
        email
        user {
          id
          email
          firstName
          lastName
        }
      }
      coach {
        id
        firstName
        lastName
        email
        users {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: ID!) {
    noteDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// MESSAGE TEMPLATE OPERATIONS
// ============================================================================

export const GET_SCRIPT_COMPONENTS_BY_USER = gql`
  query GetScriptComponentsByUser($userId: ID!) {
    scriptComponentsList(
      filter: {
        user: {
          id: { equals: $userId }
        }
      }
    ) {
      items {
        id
        intro
        hook
        body1
        body2
        ending
        user {
          id
          email
          firstName
          lastName
        }
        lead {
          id
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_SCRIPT_COMPONENT_TEMPLATE = gql`
  mutation CreateScriptComponentTemplate($data: ScriptComponentCreateInput!) {
    scriptComponentCreate(data: $data) {
      id
      intro
      hook
      body1
      body2
      ending
      user {
        id
        email
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SCRIPT_COMPONENT_TEMPLATE = gql`
  mutation UpdateScriptComponentTemplate($id: ID!, $data: ScriptComponentUpdateInput!) {
    scriptComponentUpdate(filter: { id: $id }, data: $data) {
      id
      intro
      hook
      body1
      body2
      ending
      user {
        id
        email
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SCRIPT_COMPONENT_TEMPLATE = gql`
  mutation DeleteScriptComponentTemplate($id: ID!) {
    scriptComponentDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// GLOBAL VARIABLES OPERATIONS
// ============================================================================

export const GET_GLOBAL_VARIABLES_BY_FILTER = gql`
  query GetGlobalVariablesByFilter($filter: GlobalVariableFilter) {
    globalVariablesList(filter: $filter) {
      items {
        id
        hourly_pay
        cost_per_photo
        target_profit_margin
        user {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_GLOBAL_VARIABLES = gql`
  mutation UpdateGlobalVariables($id: ID!, $data: GlobalVariableUpdateInput!) {
    globalVariableUpdate(filter: { id: $id }, data: $data) {
      id
      hourly_pay
      cost_per_photo
      target_profit_margin
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_GLOBAL_VARIABLES = gql`
  mutation CreateGlobalVariables($data: GlobalVariableCreateInput!) {
    globalVariableCreate(data: $data) {
      id
      hourly_pay
      cost_per_photo
      target_profit_margin
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

export const GET_PRODUCTS_BY_FILTER = gql`
  query GetProductsByFilter($filter: ProductFilter) {
    productsList(filter: $filter) {
      items {
        id
        name
        price
        user {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($data: ProductCreateInput!) {
    productCreate(data: $data) {
      id
      name
      price
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $data: ProductUpdateInput!) {
    productUpdate(filter: { id: $id }, data: $data) {
      id
      name
      price
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    productDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// SUBITEM OPERATIONS
// ============================================================================

export const GET_SUBITEMS_BY_FILTER = gql`
  query GetSubitemsByFilter($filter: SubitemFilter) {
    subitemsList(filter: $filter) {
      items {
        id
        type
        label
        value
        product {
          id
          name
          price
          user {
            id
            email
            firstName
            lastName
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_SUBITEM = gql`
  mutation CreateSubitem($data: SubitemCreateInput!) {
    subitemCreate(data: $data) {
      id
      type
      label
      value
      product {
        id
        name
        price
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SUBITEM = gql`
  mutation UpdateSubitem($id: ID!, $data: SubitemUpdateInput!) {
    subitemUpdate(filter: { id: $id }, data: $data) {
      id
      type
      label
      value
      product {
        id
        name
        price
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SUBITEM = gql`
  mutation DeleteSubitem($id: ID!) {
    subitemDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// STUDENT ANALYTICS OPERATIONS
// ============================================================================

export const GET_STUDENT_HIGHEST_REVENUE_BY_FILTER = gql`
  query GetStudentHighestRevenueByFilter($filter: WeeklyReportFilter) {
    weeklyReportsList(filter: $filter, sort: { revenue: DESC }, first: 1) {
      items {
        id
        revenue
        student {
          id
          phone
          business_name
          location
          target_market
          strengths
          challenges
          goals
          preferred_contact_method
          availability
          notes
          user {
            id
            email
            firstName
            lastName
          }
        }
        createdBy {
          id
          email
          firstName
          lastName
        }
        createdAt
      }
    }
  }
`;

export const GET_ALL_STUDENTS_WITH_METRICS_BY_FILTER = gql`
  query GetAllStudentsWithMetricsByFilter($filter: UserFilter) {
    usersList(filter: $filter) {
      items {
        id
        email
        firstName
        lastName
        status
        createdAt
        updatedAt
        roles {
          items {
            id
            name
          }
        }
        weeklyReports {
          items {
            id
            revenue
            createdAt
          }
        }
      }
    }
  }
`;

// ============================================================================
// PLATFORM OVERVIEW OPERATIONS (for Super Admin)
// ============================================================================

export const GET_PLATFORM_OVERVIEW = gql`
  query GetPlatformOverview {
    platformOverview {
      totalUsers
      totalStudents
      totalCoaches
      totalRevenue
      activeUsers
      conversionRate
    }
  }
`;

export const GET_SYSTEM_STATISTICS = gql`
  query GetSystemStatistics {
    systemStatistics {
      userGrowth
      revenueGrowth
      engagementMetrics
      performanceMetrics
    }
  }
`;

export const GET_COACH_ANALYTICS = gql`
  query GetCoachAnalytics($coachId: ID) {
    coachAnalytics(coachId: $coachId) {
      coachId
      coachName
      studentCount
      averagePerformance
      revenueGenerated
      successRate
    }
  }
`;

// ============================================================================
// KPI OPERATIONS
// ============================================================================

export const GET_STUDENT_KPI_DATA_BY_FILTER = gql`
  query GetStudentKPIDataByFilter($filter: StudentKPIDataFilter) {
    studentKPIDataList(filter: $filter) {
      items {
        student_id
        student_name
        student_email
        assigned_coach_id
        coach_name
        is_paid_user
        total_leads
        new_leads
        leads_by_source
        leads_by_status
        total_dms_sent
        initial_dms_sent
        follow_up_dms_sent
        total_calls_made
        initial_calls_made
        follow_up_calls_made
        engagement_completion_rate
        conversion_rate
        avg_time_to_first_contact
        avg_time_to_conversion
        activity_trend
        last_activity_date
        time_frame
      }
    }
  }
`;

export const GET_KPI_CHART_DATA = gql`
  query GetKPIChartData($studentIds: [ID!]!, $timeFrame: TimeFrameInput!) {
    kpiChartData(studentIds: $studentIds, timeFrame: $timeFrame) {
      date
      leads
      dms
      calls
      conversions
    }
  }
`;

export const GET_KPI_BENCHMARKS = gql`
  query GetKPIBenchmarks {
    kpiBenchmarks {
      weekly_new_leads
      weekly_dms_sent
      weekly_calls_made
      monthly_new_leads
      monthly_dms_sent
      monthly_calls_made
      monthly_conversion_rate
      target_engagement_completion_rate
      max_days_without_activity
    }
  }
`;

export const UPDATE_KPI_BENCHMARKS = gql`
  mutation UpdateKPIBenchmarks($updates: KPIBenchmarksUpdateInput!) {
    kpiBenchmarksUpdate(updates: $updates) {
      weekly_new_leads
      weekly_dms_sent
      weekly_calls_made
      monthly_new_leads
      monthly_dms_sent
      monthly_calls_made
      monthly_conversion_rate
      target_engagement_completion_rate
      max_days_without_activity
    }
  }
`;

// ============================================================================
// BULK OPERATIONS (for Super Admin)
// ============================================================================

export const BULK_ASSIGN_STUDENTS_TO_COACH = gql`
  mutation BulkAssignStudentsToCoach($assignments: [StudentCoachAssignmentInput!]!) {
    bulkAssignStudentsToCoach(assignments: $assignments) {
      success
      message
      updatedCount
    }
  }
`;

export const BULK_UPDATE_USER_STATUS = gql`
  mutation BulkUpdateUserStatus($updates: [UserStatusUpdateInput!]!) {
    bulkUpdateUserStatus(updates: $updates) {
      success
      message
      updatedCount
    }
  }
`;

// ============================================================================
// USER ACTIVITY LOG OPERATIONS
// ============================================================================

export const GET_USER_ACTIVITY_LOG = gql`
  query GetUserActivityLog($userId: ID!, $timeFrame: TimeFrameInput) {
    userActivityLog(userId: $userId, timeFrame: $timeFrame) {
      userId
      activities {
        type
        description
        timestamp
        metadata
      }
      summary {
        totalActivities
        activityTypes
        lastActivity
      }
    }
  }
`;

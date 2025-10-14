import { gql } from '@apollo/client';

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    user {
      id
      firstName
      lastName
      email
      origin
      status
      createdAt
      updatedAt
      avatar {
        downloadUrl
      }
      roles {
        items {
          id
          name
          description
        }
      }
    }
  }
`;

// Query to get all 8base users
export const GET_ALL_8BASE_USERS = gql`
   query GetUsers {
    usersList {
      items {
        id
        email
        status
        origin
        is8base
        firstName
        lastName
        timezone
        avatar {
          downloadUrl
        }
        roles {
          items {
            id
            name
          }
        }
        assigned_admin_id
        access_start
        access_end
        has_paid
        is_active
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
          coachType
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

// Query to get 8base user by ID
export const GET_8BASE_USER_BY_ID = gql`
  query Get8BaseUserById($id: ID!) {
    user(id: $id) {
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
      assigned_admin_id
      access_start
      access_end
      has_paid
      is_active
      createdAt
      updatedAt
    }
  }
`;

// Query to get 8base user by email
export const GET_8BASE_USER_BY_EMAIL = gql`
  query Get8BaseUserByEmail($email: String!) {
    usersList(filter: { email: { equals: $email } }) {
      items {
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
        assigned_admin_id
        access_start
        access_end
        has_paid
        is_active
        createdAt
        updatedAt
      }
    }
  }
`;

// Query to get user by email (direct query)
export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    usersList(filter: { email: { equals: $email } }) {
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
        is_active
        has_paid
        access_start
        access_end
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
        }
      }
    }
  }
`;

// Mutation to create new 8base user
export const CREATE_8BASE_USER = gql`
  mutation Create8BaseUser($input: UserCreateInput!) {
    userCreate(data: $input) {
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

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($data: UserCreateInput!) {
    userCreate(data: $data) {
      id
      firstName
      lastName
      email
      origin
      status
      has_paid
      is_active
      assigned_admin_id
      access_start
      access_end
      createdAt
      updatedAt
      avatar {
        downloadUrl
      }
      roles {
        items {
          id
          name
          description
        }
      }
    }
  }
`;

// Mutation to update 8base user
export const UPDATE_8BASE_USER = gql`
  mutation Update8BaseUser($id: ID!, $input: UserUpdateInput!) {
    userUpdate(data: $input) {
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
      isActive
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $firstName: String, $lastName: String, $email: String, $origin: String, $status: String) {
    userUpdate(data: { 
      id: $id, 
      firstName: $firstName, 
      lastName: $lastName, 
      email: $email, 
      origin: $origin, 
      status: $status 
    }) {
      id
      firstName
      lastName
      email
      origin
      status
      updatedAt
      avatar {
        downloadUrl
      }
      roles {
        items {
          id
          name
          description
        }
      }
    }
  }
`;

// Mutation to delete 8base user
export const DELETE_8BASE_USER = gql`
  mutation Delete8BaseUser($id: ID!) {
    userDelete(data: { id: $id }) {
      id
    }
  }
`;

// Mutation to assign role to user
export const ASSIGN_ROLE_TO_USER = gql`
  mutation AssignRoleToUser($userId: ID!, $roleId: ID!) {
    userUpdate(data: { 
      id: $userId, 
      roles: { 
        connect: { id: $roleId } 
      } 
    }) {
      id
      roles {
        items {
          id
          name
        }
      }
    }
  }
`;

// Mutation to remove role from user
export const REMOVE_ROLE_FROM_USER = gql`
  mutation RemoveRoleFromUser($userId: ID!, $roleId: ID!) {
    userUpdate(data: { 
      id: $userId, 
      roles: { 
        disconnect: { id: $roleId } 
      } 
    }) {
      id
      roles {
        items {
          id
          name
        }
      }
    }
  }
`;

// Query to get all available roles
export const GET_ALL_ROLES = gql`
  query GetAllRoles {
    rolesList {
      items {
        id
        name
      }
    }
  }
`;

// Query to get user's roles
export const GET_USER_ROLES = gql`
  query GetUserRoles($userId: ID!) {
    user(id: $userId) {
      id
      roles {
        items {
          id
          name
          description
        }
      }
    }
  }
`;

// Mutation to create student user with assigned coach
export const CREATE_STUDENT_USER = gql`
  mutation CreateStudentUser($data: UserCreateInput!) {
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
      assigned_admin_id
      access_start
      access_end
      has_paid
      is_active
      createdAt
      updatedAt
    }
  }
`;

// Mutation to create coach user with assigned students
export const CREATE_COACH_USER = gql`
  mutation CreateCoachUser($data: UserCreateInput!) {
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

// Mutation to create user with custom fields (for other roles)
export const CREATE_USER_WITH_CUSTOM_FIELDS = gql`
  mutation CreateUserWithCustomFields($input: UserCreateInput!) {
    userCreate(data: $input) {
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

// Query to get users with custom fields
export const GET_USERS_WITH_CUSTOM_FIELDS = gql`
  query GetUsersWithCustomFields {
    usersList {
      items {
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
        assigned_admin_id
        access_start
        access_end
        has_paid
        is_active
        createdAt
        updatedAt
      }
    }
  }
`;

// NEW: Create Student with Profile
export const CREATE_STUDENT_WITH_PROFILE = gql`
  mutation CreateStudentWithProfile(
    $userData: UserCreateInput!
    $studentData: StudentCreateInput!
  ) {
    # First create the user
    user: userCreate(data: $userData) {
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
    }
    
    # Then create the student profile
    student: studentCreate(data: $studentData) {
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
      createdAt
      updatedAt
    }
  }
`;

// NEW: Create Coach with Profile
export const CREATE_COACH_WITH_PROFILE = gql`
  mutation CreateCoachWithProfile(
    $userData: UserCreateInput!
    $coachData: CoachCreateInput!
  ) {
    # First create the user
    user: userCreate(data: $userData) {
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
    }
    
    # Then create the coach profile
    coach: coachCreate(data: $coachData) {
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
        email
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

// NEW: Get Students with Profiles
export const GET_STUDENTS_WITH_PROFILES = gql`
  query GetStudentsWithProfiles {
    usersList(filter: { roles: { some: { name: { equals: "student" } } } }) {
      items {
        id
        firstName
        lastName
        email
        roles {
          items {
            id
            name
          }
        }
        assigned_admin_id
        access_start
        access_end
        has_paid
        is_active
        createdAt
        updatedAt
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
          createdAt
          updatedAt
          coach {
            id
            firstName
            lastName
            email
            users {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    }
  }
`;

// NEW: Get Coaches with Profiles
export const GET_COACHES_WITH_PROFILES = gql`
  query GetCoachesWithProfiles {
    usersList(filter: { roles: { some: { name: { equals: "admin" } } } }) {
      items {
        id
        firstName
        lastName
        email
        roles {
          items {
            id
            name
          }
        }
        createdAt
        is_active
        coach {
          id
          firstName
          lastName
          email
          bio
          profileImage {
            downloadUrl
          }
          assignedStudents {
            id
            email
            firstName
            lastName
          }
          session {
            id
            title
            description
            dateTime
            status
          }
          createdAt
          updatedAt
        }
      }
    }
  }
`; 
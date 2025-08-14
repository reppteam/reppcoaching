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
        assignedCoach {
          id
          fullName
          email
        }
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
        }
        coach {
          id
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
        createdAt
        updatedAt
      }
    }
  }
`;

// Query to get user by email (direct query)
export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    user(email: $email) {
      email
      firstName
      id
      lastName
      roles {
        items {
          id
          name
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
      assignedCoach {
        id
        fullName
        email
      }
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
      student {
        items {
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
        createdAt
        updatedAt
      }
    }
  }
`; 
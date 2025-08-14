export interface StaticRole {
  id: string;
  name: string;
}

export const STATIC_ROLES: StaticRole[] = [
  {
    id: "cmd8ptv8l004y02jr4kf7dqk5",
    name: "Guest"
  },
  {
    id: "cmd8ptv8y004z02jrdcux9mjs",
    name: "Administrator"
  },
  {
    id: "cmd8pxiii00fo02jx4o4y6pkr",
    name: "Coach"
  },
  {
    id: "cmd8py8ob005802js5hgsed2l",
    name: "Student"
  },
  {
    id: "cmdiry4vj002l02l6fr0d0qdh",
    name: "coach_manager"
  },
  {
    id: "cme9t90k7002t02jm4ooyaqdx",
    name: "SuperAdmin"
  }
];

// Helper function to get role by name
export const getRoleByName = (name: string): StaticRole | undefined => {
  return STATIC_ROLES.find(role => role.name === name);
};

// Helper function to get role by ID
export const getRoleById = (id: string): StaticRole | undefined => {
  return STATIC_ROLES.find(role => role.id === id);
};

// Helper function to map application roles to 8base roles
export const mapApplicationRoleTo8baseRole = (appRole: string): StaticRole | undefined => {
  const roleMapping: Record<string, string> = {
    'user': 'Student',
    'coach': 'Coach',
    'coach_manager': 'coach_manager',
    'super_admin': 'Administrator'
  };

  const targetRoleName = roleMapping[appRole];
  return targetRoleName ? getRoleByName(targetRoleName) : undefined;
};

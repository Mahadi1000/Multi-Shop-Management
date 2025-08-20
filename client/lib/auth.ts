export interface User {
  id: string
  username: string
  password: string // In production, this would be hashed
  shopNames: string[]
  createdAt: string
}

export interface AuthSession {
  userId: string
  username: string
  shopNames: string[]
  expiresAt: string
  rememberMe: boolean
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must include at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must include at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Shop name validation
export function validateShopNames(shopNames: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (shopNames.length < 3) {
    errors.push("You must enter at least 3 shop names")
  }

  const uniqueNames = new Set(shopNames.filter((name) => name.trim()))
  if (uniqueNames.size !== shopNames.length) {
    errors.push("All shop names must be unique")
  }

  // Check global uniqueness
  const existingUsers = getUsers()
  const allExistingShops = existingUsers.flatMap((user) => user.shopNames)

  for (const shopName of shopNames) {
    if (allExistingShops.includes(shopName.trim())) {
      errors.push(`Shop name "${shopName}" is already taken`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Local storage operations
export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem("auth_users")
  return users ? JSON.parse(users) : []
}

export function saveUser(user: User): void {
  if (typeof window === "undefined") return
  const users = getUsers()
  users.push(user)
  localStorage.setItem("auth_users", JSON.stringify(users))
}

export function findUserByUsername(username: string): User | null {
  const users = getUsers()
  return users.find((user) => user.username === username) || null
}

// Session management
export function createSession(user: User, rememberMe: boolean): AuthSession {
  const expirationTime = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000 // 7 days or 30 minutes
  const session: AuthSession = {
    userId: user.id,
    username: user.username,
    shopNames: user.shopNames,
    expiresAt: new Date(Date.now() + expirationTime).toISOString(),
    rememberMe,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("auth_session", JSON.stringify(session))
  }

  return session
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  const session = localStorage.getItem("auth_session")
  if (!session) return null

  const parsedSession: AuthSession = JSON.parse(session)

  // Check if session is expired
  if (new Date(parsedSession.expiresAt) < new Date()) {
    clearSession()
    return null
  }

  return parsedSession
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_session")
}

// Authentication functions
export async function signUp(
  username: string,
  password: string,
  shopNames: string[],
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []

  // Validate username
  if (!username.trim()) {
    errors.push("Username is required")
  } else if (findUserByUsername(username)) {
    errors.push("Username already exists")
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors)
  }

  // Validate shop names
  const shopValidation = validateShopNames(shopNames)
  if (!shopValidation.isValid) {
    errors.push(...shopValidation.errors)
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  // Create user
  const user: User = {
    id: crypto.randomUUID(),
    username: username.trim(),
    password, // In production, hash this
    shopNames: shopNames.map((name) => name.trim()),
    createdAt: new Date().toISOString(),
  }

  saveUser(user)
  return { success: true, errors: [] }
}

export async function signIn(
  username: string,
  password: string,
  rememberMe: boolean,
): Promise<{ success: boolean; errors: string[]; session?: AuthSession }> {
  const user = findUserByUsername(username)

  if (!user) {
    return { success: false, errors: ["User not found"] }
  }

  if (user.password !== password) {
    return { success: false, errors: ["Incorrect password"] }
  }

  const session = createSession(user, rememberMe)
  return { success: true, errors: [], session }
}

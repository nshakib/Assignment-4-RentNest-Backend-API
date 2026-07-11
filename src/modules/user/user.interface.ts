export interface IUpdateProfilePayload {
    name?: string
    email?: string 
}

export interface IChangePasswordPayload {
    oldPassword: string
    newPassword: string
}
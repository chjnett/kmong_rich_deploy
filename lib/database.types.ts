export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: number
                    name: string
                    order: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    order?: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    order?: number
                    created_at?: string
                }
            }
            sub_categories: {
                Row: {
                    id: number
                    category_id: number
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    category_id: number
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    category_id?: number
                    name?: string
                    created_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    sub_id: number
                    name: string
                    img_urls: string[]
                    external_url: string
                    description: string
                    specs: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    sub_id: number
                    name: string
                    img_urls: string[]
                    external_url: string
                    description: string
                    specs: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    sub_id?: number
                    name?: string
                    img_urls?: string[]
                    external_url?: string
                    description?: string
                    specs?: Json
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    role: 'user' | 'admin'
                    created_at: string
                }
                Insert: {
                    id: string
                    role?: 'user' | 'admin'
                    created_at?: string
                }
                Update: {
                    id?: string
                    role?: 'user' | 'admin'
                    created_at?: string
                }
            }
        }
    }
}

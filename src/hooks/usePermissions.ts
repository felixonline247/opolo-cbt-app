"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function usePermissions() {
  const [userRole, setUserRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: staffData, error } = await supabase
          .from("staff")
          .select(`
            *,
            roles (
              name,
              permissions
            )
          `)
          .eq("email", user.email?.toLowerCase())
          .single();

        if (error) {
          console.error("Permission Hook Error:", error.message);
        }

        if (staffData && staffData.roles) {
          setUserRole(staffData.roles);
        }
      } catch (err) {
        console.error("Unexpected Error in usePermissions:", err);
      } finally {
        setLoading(false);
      }
    }
    getRole();
  }, []);

  const hasPermission = (permission: string) => {
    // 1. If still loading, return true temporarily to prevent 
    // ProtectedRoute from redirecting before the data arrives
    if (loading) return true; 
    
    if (!userRole || !userRole.permissions) return false;

    // 2. Ensure perms is an array (handles JSONB vs String cases)
    let perms = userRole.permissions;
    if (typeof perms === 'string') {
      try {
        perms = JSON.parse(perms);
      } catch (e) {
        perms = [];
      }
    }

    if (!Array.isArray(perms)) return false;

    // 3. Robust Check: Lowercase everything for a perfect match
    const normalizedPerms = perms.map((p: string) => p.toLowerCase());
    
    return (
      normalizedPerms.includes("all") || 
      normalizedPerms.includes(permission.toLowerCase())
    );
  };

  return { hasPermission, loading, roleName: userRole?.name };
}
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
          .eq("email", user.email?.toLowerCase()) // Case-insensitive match
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
    // While loading, we shouldn't assume permission, but we also shouldn't block 
    // the system if we haven't finished the check yet.
    if (loading) return false; 
    
    if (!userRole || !userRole.permissions) return false;

    // Check for global admin "all" or specific permission
    const perms = userRole.permissions;
    return perms.includes("all") || perms.includes(permission);
  };

  return { hasPermission, loading, roleName: userRole?.name };
}
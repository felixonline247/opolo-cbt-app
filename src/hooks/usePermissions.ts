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
    // 1. Stay open while loading to prevent premature redirects
    if (loading) return true; 
    
    if (!userRole || !userRole.permissions) return false;

    /**
     * FLEXIBLE CHECK:
     * We stringify the permissions and search for the key. 
     * This handles:
     * - Real JSONB arrays: ["all"]
     * - Stringified arrays: '["all"]'
     * - Case sensitivity: "ALL" vs "all"
     */
    const permsString = JSON.stringify(userRole.permissions).toLowerCase();
    
    // Check for the master "all" key
    if (permsString.includes('"all"')) return true;
    
    // Check for the specific permission key requested
    return permsString.includes(`"${permission.toLowerCase()}"`);
  };

  return { hasPermission, loading, roleName: userRole?.name };
}
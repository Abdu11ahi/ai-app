"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Edit,
  Mail, 
  Calendar 
} from "lucide-react";
import { UserProfile } from "@/lib/user-utils";

type ProfileHeaderProps = {
  profile: UserProfile;
  isCurrentUser: boolean;
};

export function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
  const { 
    email, 
    fullName, 
    avatarUrl, 
    createdAt 
  } = profile;
  
  // Generate initials from name or email
  const getInitials = () => {
    if (fullName) {
      const nameParts = fullName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    // Fallback to email
    return email.substring(0, 2).toUpperCase();
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center pb-6 border-b">
      <Avatar className="h-24 w-24 border-4 border-muted">
        <AvatarImage src={avatarUrl || ''} alt={fullName || email} />
        <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="space-y-1 flex-1">
        <h1 className="text-2xl font-bold">{fullName || email.split('@')[0]}</h1>
        
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-1" />
            {email}
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Joined {formatDate(createdAt)}
          </div>
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="ml-auto">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
} 
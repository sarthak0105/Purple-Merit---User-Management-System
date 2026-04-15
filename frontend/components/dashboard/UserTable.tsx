'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit2, Trash2, Search } from 'lucide-react';

interface UserTableProps {
  users: User[];
  isLoading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onSearch?: (query: string) => void;
}

export function UserTable({ users, isLoading, onEdit, onDelete, onSearch }: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/20 text-primary border border-primary/30';
      case 'inactive':
        return 'bg-muted/20 text-muted-foreground border border-muted/30';
      case 'suspended':
        return 'bg-destructive/20 text-destructive border border-destructive/30';
      default:
        return 'bg-border/20 text-foreground border border-border/30';
    }
  };

  return (
    <Card className="card-gradient border border-border">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Users</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all users in the system
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-green">
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-input border-secondary/30 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-foreground font-semibold">Name</TableHead>
                <TableHead className="text-foreground font-semibold">Email</TableHead>
                <TableHead className="text-foreground font-semibold">Role</TableHead>
                <TableHead className="text-foreground font-semibold">Status</TableHead>
                <TableHead className="text-foreground font-semibold">Created</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-border/50 hover:bg-card/50 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-foreground">
                      <span className="text-secondary font-medium capitalize">
                        {user.role?.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit?.(user)}
                          className="text-secondary hover:text-secondary hover:bg-secondary/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete?.(user)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Info */}
        {!isLoading && users.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {users.length} users</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

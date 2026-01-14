import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, ChatCircle, PaperPlaneTilt, CheckCircle, Clock, Database, GitBranch, Play, Pause } from '@phosphor-icons/react'
import { CollaborationUser, CollaborationActivity, CollaborationComment } from '@/lib/types'
import { toast } from 'sonner'

export function CollaborationPanel() {
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null)
  const [activeUsers, setActiveUsers] = useKV<CollaborationUser[]>('collaboration-active-users', [])
  const [activities, setActivities] = useKV<CollaborationActivity[]>('collaboration-activities', [])
  const [comments, setComments] = useKV<CollaborationComment[]>('collaboration-comments', [])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const user = await window.spark.user()
      if (!user) {
        setIsLoading(false)
        return
      }

      const collaborationUser: CollaborationUser = {
        id: String(user.id),
        login: user.login,
        avatarUrl: user.avatarUrl,
        email: user.email,
        isOwner: user.isOwner,
      }
      setCurrentUser(collaborationUser)
      
      setActiveUsers((current) => {
        const filtered = (current || []).filter(u => u.id !== String(user.id))
        return [...filtered, collaborationUser]
      })

      setActivities((current) => [
        ...((current || []).slice(-50)),
        {
          id: `activity-${Date.now()}`,
          userId: String(user.id),
          userName: user.login,
          userAvatar: user.avatarUrl,
          action: 'joined',
          timestamp: new Date().toISOString(),
        }
      ])

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load user:', error)
      setIsLoading(false)
    }
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return

    const comment: CollaborationComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.login,
      userAvatar: currentUser.avatarUrl,
      message: newComment.trim(),
      timestamp: new Date().toISOString(),
      resolved: false,
    }

    setComments((current) => [...(current || []), comment])
    
    setActivities((current) => [
      ...((current || []).slice(-50)),
      {
        id: `activity-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.login,
        userAvatar: currentUser.avatarUrl,
        action: 'commented',
        timestamp: new Date().toISOString(),
        details: newComment.trim().slice(0, 50),
      }
    ])

    setNewComment('')
    toast.success('Comment added')
  }

  const handleResolveComment = (commentId: string) => {
    setComments((current) =>
      (current || []).map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
    )
  }

  const getActivityIcon = (action: CollaborationActivity['action']) => {
    switch (action) {
      case 'joined':
      case 'left':
        return <Users size={16} weight="bold" />
      case 'modified-mapping':
        return <GitBranch size={16} weight="bold" />
      case 'started-migration':
        return <Play size={16} weight="bold" />
      case 'paused-migration':
        return <Pause size={16} weight="bold" />
      case 'added-connection':
        return <Database size={16} weight="bold" />
      case 'commented':
        return <ChatCircle size={16} weight="bold" />
      default:
        return <Clock size={16} weight="bold" />
    }
  }

  const getActivityColor = (action: CollaborationActivity['action']) => {
    switch (action) {
      case 'joined':
        return 'text-success'
      case 'left':
        return 'text-muted-foreground'
      case 'started-migration':
        return 'text-primary'
      case 'paused-migration':
        return 'text-warning'
      case 'commented':
        return 'text-accent'
      default:
        return 'text-foreground'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Users size={48} className="mx-auto text-muted-foreground opacity-50" weight="duotone" />
            <p className="text-sm text-muted-foreground">Loading collaboration...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChatCircle size={24} weight="duotone" className="text-primary" />
            Comments & Discussion
          </CardTitle>
          <CardDescription>
            Collaborate with your team on migration planning and execution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={currentUser?.avatarUrl} />
              <AvatarFallback>{currentUser?.login.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Add a comment or question..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <PaperPlaneTilt size={18} weight="bold" />
              </Button>
            </div>
          </div>

          <Separator />

          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {(comments || []).length === 0 ? (
                <div className="text-center py-12">
                  <ChatCircle size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" weight="duotone" />
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a discussion about this migration</p>
                </div>
              ) : (
                [...(comments || [])].reverse().map((comment) => (
                  <div key={comment.id} className={`flex gap-3 p-4 rounded-lg border ${comment.resolved ? 'bg-muted/50 border-border' : 'bg-card border-border'}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback>{comment.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{comment.userName}</span>
                          {comment.resolved && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle size={12} className="mr-1" weight="bold" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.message}</p>
                      {!comment.resolved && currentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResolveComment(comment.id)}
                          className="text-xs mt-2"
                        >
                          <CheckCircle size={14} className="mr-1" weight="bold" />
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users size={20} weight="duotone" className="text-primary" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(activeUsers || []).length === 0 ? (
                <div className="text-center py-8">
                  <Users size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" weight="duotone" />
                  <p className="text-xs text-muted-foreground">No active users</p>
                </div>
              ) : (
                (activeUsers || []).map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.login}</p>
                        {user.isOwner && (
                          <Badge variant="secondary" className="text-xs">
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock size={20} weight="duotone" className="text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              <div className="space-y-3 pr-4">
                {(activities || []).length === 0 ? (
                  <div className="text-center py-8">
                    <Clock size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" weight="duotone" />
                    <p className="text-xs text-muted-foreground">No activity yet</p>
                  </div>
                ) : (
                  [...(activities || [])].reverse().slice(0, 20).map((activity) => (
                    <div key={activity.id} className="flex gap-3 items-start">
                      <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${getActivityColor(activity.action)}`}>
                        {getActivityIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.userName}</span>{' '}
                          <span className="text-muted-foreground">
                            {activity.action.replace(/-/g, ' ')}
                          </span>
                        </p>
                        {activity.details && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {activity.details}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

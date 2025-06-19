"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, UserPlus, UserMinus, Edit, Mail } from "lucide-react"
import { getActivityStatusMap } from "@/helpers/getActivityStatusMap"

interface TeamActivity {
    id: string
    type: "member_added" | "member_removed" | "role_changed" | "invitation_sent" | "invitation_accepted"
    description: string
    user_name: string
    target_user_name?: string
    target_user_email?: string
    old_role?: string
    new_role?: string
    created_at: string
}

export default function TeamActivityPage() {
    const [activities, setActivities] = useState<TeamActivity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTeamActivity()
    }, [])

    const fetchTeamActivity = async () => {
        try {
            const response = await fetch("/api/team/activity")
            const data = await response.json()
            setActivities(data.activities || [])
        } catch (error) {
            console.error("Error fetching team activity:", error)
        } finally {
            setLoading(false)
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "member_added":
            case "invitation_accepted":
                return <UserPlus className="h-4 w-4 text-teal-500" />
            case "member_removed":
                return <UserMinus className="h-4 w-4 text-red-500" />
            case "role_changed":
                return <Edit className="h-4 w-4 text-blue-500" />
            case "invitation_sent":
                return <Mail className="h-4 w-4 text-yellow-500" />
            default:
                return <Activity className="h-4 w-4 text-gray-500" />
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case "member_added":
            case "invitation_accepted":
                return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
            case "member_removed":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            case "role_changed":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            case "invitation_sent":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR")
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Carregando atividades...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Atividades da Equipe</h1>
                <p className="text-muted-foreground">Histórico de mudanças na equipe</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5" />
                        Histórico de Atividades
                    </CardTitle>
                    <CardDescription>Todas as ações realizadas na gestão da equipe</CardDescription>
                </CardHeader>
                <CardContent>
                    {activities.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Nenhuma atividade registrada</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                    <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{activity.description}</p>
                                            <Badge className={getActivityColor(activity.type)} variant="secondary">
                                                {getActivityStatusMap(activity.type)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <p className="text-xs text-muted-foreground">Por: {activity.user_name}</p>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                                        </div>
                                        {activity.target_user_name && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Usuário: {activity.target_user_name}
                                                {activity.target_user_email && ` (${activity.target_user_email})`}
                                            </p>
                                        )}
                                        {activity.old_role && activity.new_role && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Função alterada de {activity.old_role} para {activity.new_role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Phone, 
  Shield,
  FileText,
  History
} from "lucide-react";

interface UserProfile {
  id: string;
  vkId: string | null;
  telegramId: string | null;
  phone: string | null;
  role: string;
  dailyFreeQueries: number | null;
  lastQueryDate: string | null;
  createdAt: string | null;
}

interface LegalQuery {
  id: string;
  category: string | null;
  question: string;
  aiResponse: string | null;
  modelUsed: string | null;
  tokensUsed: number | null;
  isPremium: boolean | null;
  createdAt: string | null;
}

interface Consultation {
  id: string;
  status: string;
  lawyerId: string | null;
  scheduledAt: string | null;
  createdAt: string | null;
}

interface UsageLog {
  id: string;
  endpoint: string | null;
  timestamp: string | null;
}

interface ProfileData {
  profile: UserProfile;
  queries: LegalQuery[];
  consultations: Consultation[];
  logs: UsageLog[];
}

export function ProfileClient({ initialData }: { initialData: ProfileData }) {
  const [data] = useState<ProfileData>(initialData);
  const { profile, queries, consultations, logs } = data;

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      user: { label: "Пользователь", variant: "secondary" },
      premium_user: { label: "Премиум", variant: "default" },
      admin: { label: "Администратор", variant: "destructive" },
      lawyer: { label: "Юрист", variant: "outline" },
    };
    return roles[role] || { label: role, variant: "secondary" };
  };

  const roleBadge = getRoleBadge(profile.role);

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Профиль
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-xs">{profile.id}</span>
              </div>
              {profile.vkId && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">VK ID:</span>
                  <span>{profile.vkId}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Телефон:</span>
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600">Бесплатных запросов:</span>
                <span className="font-semibold">{profile.dailyFreeQueries ?? 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Регистрация:</span>
                <span>{formatDate(profile.createdAt)}</span>
              </div>
              {profile.lastQueryDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">Последний запрос:</span>
                  <span>{formatDate(profile.lastQueryDate)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Queries, Consultations, Logs */}
      <Tabs defaultValue="queries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queries" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Запросы ({queries.length})
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Консультации ({consultations.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Логи ({logs.length})
          </TabsTrigger>
        </TabsList>

        {/* Queries Tab */}
        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                История запросов к ИИ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {queries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Запросов пока нет</p>
              ) : (
                <div className="space-y-4">
                  {queries.map((query) => (
                    <div
                      key={query.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={query.isPremium ? "default" : "secondary"}>
                          {query.isPremium ? "Премиум" : "Бесплатно"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(query.createdAt)}
                        </span>
                      </div>
                      {query.category && (
                        <Badge variant="outline" className="mb-2">
                          {query.category}
                        </Badge>
                      )}
                      <p className="text-sm font-medium mb-2">{query.question}</p>
                      {query.aiResponse && (
                        <div className="bg-gray-100 rounded p-3 text-sm text-gray-700">
                          {query.aiResponse.substring(0, 200)}
                          {query.aiResponse.length > 200 && "..."}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {query.modelUsed && <span>Модель: {query.modelUsed}</span>}
                        {query.tokensUsed && <span>Токенов: {query.tokensUsed}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Консультации с юристом
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Консультаций пока нет</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Записаться на консультацию
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((consult) => (
                    <div
                      key={consult.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            consult.status === "completed"
                              ? "default"
                              : consult.status === "assigned"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {consult.status === "pending" && "Ожидание"}
                          {consult.status === "assigned" && "Назначена"}
                          {consult.status === "completed" && "Завершена"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(consult.createdAt)}
                        </span>
                      </div>
                      {consult.scheduledAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          Назначена на: {formatDate(consult.scheduledAt)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Логи использования
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Логов пока нет</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono">{log.endpoint || "—"}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

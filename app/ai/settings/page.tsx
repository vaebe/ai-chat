'use client'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
// 模型目录改为从数据库 API 获取

interface ProviderItem {
  id: string
  provider: string
  model: string
  baseURL?: string | null
  isDefault: boolean
  createdAt: string
}

export default function AiSettingsPage() {
  const [list, setList] = useState<ProviderItem[]>([])
  const [loading, setLoading] = useState(false)

  const [provider, setProvider] = useState('openai')
  const [models, setModels] = useState<
    Array<{ provider: string; model: string; displayName: string; capabilities: any }>
  >([])
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [isDefault, setIsDefault] = useState(true)

  async function fetchList() {
    setLoading(true)
    const res = await fetch('/api/ai/provider')
    const data = await res.json()
    setLoading(false)
    if (data.code === 0) setList(data.data)
    else toast.error(data.msg || '获取失败')
  }

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchModels(p?: string) {
    const url = p ? `/api/ai/models?provider=${encodeURIComponent(p)}` : '/api/ai/models'
    const res = await fetch(url)
    const data = await res.json()
    if (data.code === 0) {
      setModels(data.data)
      if (!p) {
        const first = data.data[0]
        if (first) {
          setProvider(first.provider)
          setModel(first.model)
        }
      } else {
        const first = data.data[0]
        if (first) setModel(first.model)
      }
    }
  }

  useEffect(() => {
    fetchModels(provider)
  }, [provider])

  async function onCreate() {
    if (!provider || !model || !apiKey) return toast.error('请填写 provider/model/apiKey')
    const res = await fetch('/api/ai/provider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, model, apiKey, baseURL: baseURL || undefined, isDefault })
    })
    const data = await res.json()
    if (data.code === 0) {
      toast.success('创建成功')
      setApiKey('')
      setBaseURL('')
      setIsDefault(false)
      fetchList()
    } else toast.error(data.msg || '创建失败')
  }

  async function onDelete(id: string) {
    const res = await fetch(`/api/ai/provider?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.code === 0) {
      toast.success('已删除')
      fetchList()
    } else toast.error(data.msg || '删除失败')
  }

  async function onSetDefault(id: string) {
    const res = await fetch('/api/ai/provider', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isDefault: true })
    })
    const data = await res.json()
    if (data.code === 0) {
      toast.success('已设为默认')
      fetchList()
    } else toast.error(data.msg || '设置失败')
  }

  const defaultId = useMemo(() => list.find((i) => i.isDefault)?.id, [list])

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-bold mb-4">AI 设置</h1>
      <Card>
        <CardHeader>
          <CardTitle>新增配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Provider</Label>
              <select
                className="w-full h-9 rounded border bg-background px-3 text-sm"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                {Array.from(new Set(models.map((m) => m.provider))).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Model</Label>
              <select
                className="w-full h-9 rounded border bg-background px-3 text-sm"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {models
                  .filter((m) => m.provider === provider)
                  .map((m) => (
                    <option key={m.model} value={m.model}>
                      {m.displayName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label>API Key</Label>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                type="password"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Base URL（可选）</Label>
              <Input
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isDefault} onCheckedChange={setIsDefault} id="isDefault" />
              <Label htmlFor="isDefault">设为默认</Label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {(() => {
                const info = models.find((m) => m.provider === provider && m.model === model)
                if (!info) return '请选择模型'
                const caps =
                  (typeof info.capabilities === 'string'
                    ? JSON.parse(info.capabilities)
                    : info.capabilities) || {}
                const tags = [
                  caps.reasoning ? '推理' : null,
                  caps.multimodal ? '多模态' : null,
                  caps.vision ? '视觉' : null,
                  caps.tools ? '工具' : null,
                  caps.streaming ? '流式' : null
                ].filter(Boolean)
                return `能力：${tags.join(' / ')}`
              })()}
            </div>
            <Button onClick={onCreate}>保存</Button>
          </div>
        </CardContent>
      </Card>

      <div className="h-6" />

      <Card>
        <CardHeader>
          <CardTitle>我的配置</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <div className="space-y-3">
              {list.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded border p-3">
                  <div className="text-sm">
                    <div>
                      <span className="font-medium">{item.provider}</span> / {item.model}
                      {item.baseURL ? (
                        <span className="text-muted-foreground">（{item.baseURL}）</span>
                      ) : null}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isDefault ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        默认
                      </span>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => onSetDefault(item.id)}>
                        设为默认
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
                      删除
                    </Button>
                  </div>
                </div>
              ))}
              {list.length === 0 && <div className="text-sm text-muted-foreground">暂无配置</div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

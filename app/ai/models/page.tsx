'use client'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { saListModels, saCreateModel, saUpdateModel, saDeleteModel } from '@/app/actions'

type ModelRow = {
  id: string
  provider: string
  model: string
  displayName: string
  type: string
  capabilities: any
  recommended: boolean
  createdAt: string
}

export default function AiModelsPage() {
  const [list, setList] = useState<ModelRow[]>([])
  const [loading, setLoading] = useState(false)

  const [id, setId] = useState<string | null>(null)
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o-mini')
  const [displayName, setDisplayName] = useState('OpenAI - GPT-4o mini')
  const [type, setType] = useState<'chat' | 'reasoning' | 'multimodal'>('chat')
  const [capReasoning, setCapReasoning] = useState(false)
  const [capMultimodal, setCapMultimodal] = useState(true)
  const [capVision, setCapVision] = useState(true)
  const [capTools, setCapTools] = useState(true)
  const [capStreaming, setCapStreaming] = useState(true)
  const [recommended, setRecommended] = useState(false)

  async function fetchList() {
    try {
      setLoading(true)
      const data = await saListModels()
      setList(data as any)
    } catch (e) {
      toast.error('获取失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  function resetForm() {
    setId(null)
    setProvider('openai')
    setModel('gpt-4o-mini')
    setDisplayName('OpenAI - GPT-4o mini')
    setType('chat')
    setCapReasoning(false)
    setCapMultimodal(true)
    setCapVision(true)
    setCapTools(true)
    setCapStreaming(true)
    setRecommended(false)
  }

  function fillForm(row: ModelRow) {
    setId(row.id)
    setProvider(row.provider)
    setModel(row.model)
    setDisplayName(row.displayName)
    setType(row.type as any)
    const caps =
      typeof row.capabilities === 'string' ? JSON.parse(row.capabilities) : row.capabilities
    setCapReasoning(!!caps?.reasoning)
    setCapMultimodal(!!caps?.multimodal)
    setCapVision(!!caps?.vision)
    setCapTools(!!caps?.tools)
    setCapStreaming(!!caps?.streaming)
    setRecommended(!!row.recommended)
  }

  async function onSave() {
    const payload = {
      provider,
      model,
      displayName,
      type,
      capabilities: {
        reasoning: capReasoning,
        multimodal: capMultimodal,
        vision: capVision,
        tools: capTools,
        streaming: capStreaming
      },
      recommended
    }

    try {
      if (id) await saUpdateModel({ id, ...payload })
      else await saCreateModel(payload as any)
      toast.success(id ? '更新成功' : '创建成功')
      resetForm()
      fetchList()
    } catch (e) {
      toast.error('保存失败')
    }
  }

  async function onDelete(rid: string) {
    try {
      await saDeleteModel(rid)
      toast.success('已删除')
      if (rid === id) resetForm()
      fetchList()
    } catch (e) {
      toast.error('删除失败')
    }
  }

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <h1 className="text-2xl font-bold mb-4">模型管理</h1>
      <Card>
        <CardHeader>
          <CardTitle>{id ? '编辑模型' : '新增模型'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Provider</Label>
              <Input
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="openai"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
              />
            </div>
            <div>
              <Label>显示名称</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="OpenAI - GPT-4o mini"
              />
            </div>
            <div>
              <Label>类型</Label>
              <select
                className="w-full h-9 rounded border bg-background px-3 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="chat">chat</option>
                <option value="reasoning">reasoning</option>
                <option value="multimodal">multimodal</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={capReasoning} onCheckedChange={setCapReasoning} id="capReasoning" />
              <Label htmlFor="capReasoning">推理</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={capMultimodal}
                onCheckedChange={setCapMultimodal}
                id="capMultimodal"
              />
              <Label htmlFor="capMultimodal">多模态</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={capVision} onCheckedChange={setCapVision} id="capVision" />
              <Label htmlFor="capVision">视觉</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={capTools} onCheckedChange={setCapTools} id="capTools" />
              <Label htmlFor="capTools">工具</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={capStreaming} onCheckedChange={setCapStreaming} id="capStreaming" />
              <Label htmlFor="capStreaming">流式</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={recommended} onCheckedChange={setRecommended} id="recommended" />
              <Label htmlFor="recommended">推荐</Label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onSave}>{id ? '保存修改' : '创建'}</Button>
            {id && (
              <Button variant="secondary" onClick={resetForm}>
                取消编辑
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="h-6" />

      <Card>
        <CardHeader>
          <CardTitle>模型列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <div className="space-y-3">
              {list.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded border p-3">
                  <div className="text-sm">
                    <div className="font-medium">{item.displayName}</div>
                    <div className="text-muted-foreground">
                      {item.provider} / {item.model} / {item.type}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {(() => {
                        const caps =
                          typeof item.capabilities === 'string'
                            ? JSON.parse(item.capabilities)
                            : item.capabilities
                        const tags = [
                          caps?.reasoning ? '推理' : null,
                          caps?.multimodal ? '多模态' : null,
                          caps?.vision ? '视觉' : null,
                          caps?.tools ? '工具' : null,
                          caps?.streaming ? '流式' : null
                        ].filter(Boolean)
                        return tags.join(' / ')
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.recommended && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        推荐
                      </span>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => fillForm(item)}>
                      编辑
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
                      删除
                    </Button>
                  </div>
                </div>
              ))}
              {list.length === 0 && (
                <div className="text-sm text-muted-foreground">暂无模型数据</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

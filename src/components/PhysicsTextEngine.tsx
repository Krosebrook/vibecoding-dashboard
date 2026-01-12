import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Atom } from '@phosphor-icons/react'

export function PhysicsTextEngine() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom size={24} weight="duotone" className="text-primary" />
          Physics Text Engine
        </CardTitle>
        <CardDescription>
          Component under construction
        </CardDescription>
      </CardHeader>
      <CardContent>
        Physics-based text animation engine coming soon
      </CardContent>
    </Card>
  )
}

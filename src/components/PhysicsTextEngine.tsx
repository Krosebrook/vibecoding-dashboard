import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, 
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
interface Particle {
  y: number

  charge: number
  color: str

  x: number
  y: number
  vx: number
  vy: number
  mass: number
  charge: number
  fontSize: number
  color: string


interface PhysicsConfig {
  gravity: number
  elasticity: number
  damping: number
  repulsion: boolean
  attraction: boolean
  wind: number
  turbulence: number
    name: 'Bouncy Ball',
    icon: <Atom size=
 

      attraction: 
      turbulen
      wallBounce: tru
  },
    name: 'Magnetic
 

      damping: 0.97,
  {
      turbulence: 0,
      wallBounce: true
  },
    name: 'Ch
    icon: <Waves si
      elasticity: 0.7,
      damping: 0.99,
      attraction: false
      turbulence: 0.8,
      wind: 0,
  },
    name: 'Repulsion Field'
    icon: <Atom size={
    }
    
  {
      turbulence: 0,
      wallBounce: true
  }
    config: {
  const animationRe
      elasticity: 0.9,
  const [isPlaying, s
  const [mousePos, setM
  const [config, setConf
    damping: 0
    repulsion: false
    wind: 0,
    groundFriction: 0.
    }
  co
  {
    const chars = inp
    const startX = (canvas.width - (chars.length

    config: {
      x: startX + i
      vx: (Math.random
      mass: 1,
      fontSize: 48,
    }))

    const newParticl
      groundFriction: 0.9,
  const applyPreset = 
    t

  {

    description: 'High turbulence and wind',

    config: {
        x: e.client
      })

    return () => canvas

      wind: 0.5,
        cancelAnimatio
      return

    }

  {
      setParticles(prevParti
          let { x, y, vx, vy } = particle

    config: {
            vx += c
      elasticity: 0.7,
            vx += (M
      repulsion: true,
          if (config.rep
              
              const 
              const distSq

     
  }
 

export function PhysicsTextEngine() {
  const animationRef = useRef<number | null>(null)
            const dy = mousePos.y - y

              const force = 5 / distSq * 10000
              vy += (dy / dist) * force
          }
          vx *= config.damping

          y += vy
    gravity: 0.5,
    damping: 0.98,
            vx *= co
          if (config.
    attraction: false,
            
              x = 
            }
    wallBounce: true
    

        })
        updated.forEach(particle => 
          ctx.font = `bold

          ctx.shadowColor = particle.
          ctx.fillText
        })
        if (cursorAttr

          ctx.fill()
          ctx.lineWidth = 2
      char,
        return updated
      y: startY,
    }
      vy: (Math.random() - 0.5) * 2,
      mass: 1,
    return () => {
        cancelAnima
    }

   

      if (!blob) return
      const link = document.createElement('a')
      link.download = `physics
   


    <Card className="border-
        <div className="flex items-start justify-be
   

            <CardDe
            </Car
          <B

      </CardHeader>
        <div className="grid lg:grid
            <div classN

                height={600}
              />
                <di
                    <div classNam
                    </div>
        
     

              <Button
                size="lg"
        

                   
                ) : (
                    <Play size={2
                  </>
       
            
     

              <Button
                variant="outline"
              >


              <Label htmlFor="physics-text">Text Conte

                onChange={e => setTex
                className="font-bold text-lg"
            </div>
            <div className="flex it

                  Cursor Attraction

                </p>
              <Switch
           

          </div>
          <div className="space-y-4">
              <TabsList className="w-full">
           

                <div className="space-y-2">
                    <span>Gravity</span>
                  </Label>

                    min={0}
                    step={0.1}
                  />


                    <span className="text-x
                  <Slider
                    onValueChange={([v]) => setConfig({ ...co
                
                    className="py-2"
                </div>
               
              
           

                    min={-1}
                    step={0.05}
                  />

                  <Label className="flex i

                  <Slider
                    onValueChange={([v]) => se
                    max={1}
                    className="py-2"
             
           

                  <Switch
                    checked={c


                 

                    id="attraction"
                    onCheckedChange={(checked) => set
                </div>
                <div className="flex it
           

                    checked={confi
                  />
              </TabsContent>
              <TabsContent value="pres
             
                    onClick={() => applyPreset(preset)}
                  >
                      <div className="
             
                        <div className="font-semi
                          {preset.descr
                      </div>
             
           

              <div className="flex items-cente
          

              <div className="text-xs
              </div>
          </div>
      </CardContent>
  )






































































































































































































































































































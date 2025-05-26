"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash, Edit, Car, Clock } from "lucide-react"

type Service = {
  id: string
  name: string
  description: string
  price: number
  duration: number
  isActive: boolean
}

export function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Basic Wash",
      description: "Exterior wash and quick interior vacuum",
      price: 49.99,
      duration: 30,
      isActive: true,
    },
    {
      id: "2",
      name: "Full Detail",
      description: "Complete interior and exterior detailing",
      price: 199.99,
      duration: 180,
      isActive: true,
    },
    {
      id: "3",
      name: "Ceramic Coating",
      description: "Professional ceramic coating application",
      price: 599.99,
      duration: 360,
      isActive: false,
    },
  ])

  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newService, setNewService] = useState<Omit<Service, "id">>({
    name: "",
    description: "",
    price: 0,
    duration: 60,
    isActive: true,
  })

  const handleAddService = () => {
    const id = Math.random().toString(36).substring(2, 9)
    setServices([...services, { id, ...newService }])
    setNewService({
      name: "",
      description: "",
      price: 0,
      duration: 60,
      isActive: true,
    })
    setShowForm(false)
  }

  const handleUpdateService = () => {
    if (!editingService) return

    setServices(services.map((service) => (service.id === editingService.id ? editingService : service)))
    setEditingService(null)
  }

  const handleRemoveService = (id: string) => {
    setServices(services.filter((service) => service.id !== id))
  }

  const toggleServiceStatus = (id: string) => {
    setServices(services.map((service) => (service.id === id ? { ...service, isActive: !service.isActive } : service)))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <Button
          onClick={() => {
            setShowForm(true)
            setEditingService(null)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {(showForm || editingService) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingService ? "Edit Service" : "Add New Service"}</CardTitle>
            <CardDescription>
              {editingService
                ? "Update the details of your service offering"
                : "Create a new service for your auto-detailing business"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={editingService ? editingService.name : newService.name}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, name: e.target.value })
                    : setNewService({ ...newService, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingService ? editingService.description : newService.description}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, description: e.target.value })
                    : setNewService({ ...newService, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingService ? editingService.price : newService.price}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    editingService
                      ? setEditingService({ ...editingService, price: value })
                      : setNewService({ ...newService, price: value })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={editingService ? editingService.duration : newService.duration}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    editingService
                      ? setEditingService({ ...editingService, duration: value })
                      : setNewService({ ...newService, duration: value })
                  }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={editingService ? editingService.isActive : newService.isActive}
                onCheckedChange={(checked) =>
                  editingService
                    ? setEditingService({ ...editingService, isActive: checked })
                    : setNewService({ ...newService, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active (available for booking)</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setEditingService(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingService ? handleUpdateService : handleAddService}>
              {editingService ? "Update Service" : "Add Service"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {services.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <Car className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No services added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    {service.name}
                    {!service.isActive && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Inactive
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingService(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveService(service.id)}>
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {service.duration} minutes
                  </div>
                  <div className="font-medium">${service.price.toFixed(2)}</div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2 w-full">
                  <Switch
                    id={`toggle-${service.id}`}
                    checked={service.isActive}
                    onCheckedChange={() => toggleServiceStatus(service.id)}
                  />
                  <Label htmlFor={`toggle-${service.id}`} className="flex-grow">
                    {service.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

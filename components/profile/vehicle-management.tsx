"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Plus, Trash } from "lucide-react"

type Vehicle = {
  id: string
  make: string
  model: string
  year: string
  color: string
  licensePlate: string
}

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "1",
      make: "Toyota",
      model: "Camry",
      year: "2020",
      color: "Silver",
      licensePlate: "ABC123",
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newVehicle, setNewVehicle] = useState<Omit<Vehicle, "id">>({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
  })

  const handleAddVehicle = () => {
    const id = Math.random().toString(36).substring(2, 9)
    setVehicles([...vehicles, { id, ...newVehicle }])
    setNewVehicle({
      make: "",
      model: "",
      year: "",
      color: "",
      licensePlate: "",
    })
    setShowAddForm(false)
  }

  const handleRemoveVehicle = (id: string) => {
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Vehicles</h2>
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Vehicle</CardTitle>
            <CardDescription>Enter your vehicle details for easier booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={newVehicle.licensePlate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicle}>Save Vehicle</Button>
          </CardFooter>
        </Card>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <Car className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No vehicles added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveVehicle(vehicle.id)}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Color:</span> {vehicle.color}
                  </div>
                  <div>
                    <span className="text-muted-foreground">License Plate:</span> {vehicle.licensePlate}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

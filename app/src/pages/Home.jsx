import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="p-8">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Fundamentals</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/l01">L01</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
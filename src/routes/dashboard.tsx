import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "src/components/ui/avatar";
import { Badge } from "src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { Separator } from "src/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { Heading, Typography } from "src/components/ui/typography";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const stats = [
  { label: "Revenue", value: "$48,295", delta: "+12.5%", trend: "up" },
  { label: "Active users", value: "3,842", delta: "+4.1%", trend: "up" },
  { label: "Orders", value: "1,204", delta: "-2.3%", trend: "down" },
  { label: "Conversion", value: "3.6%", delta: "+0.4%", trend: "up" },
];

const orders = [
  {
    id: "ORD-1024",
    customer: "Ada Lovelace",
    email: "ada@example.com",
    initials: "AL",
    amount: "$240.00",
    status: "Paid",
    date: "Feb 18, 2026",
  },
  {
    id: "ORD-1023",
    customer: "Grace Hopper",
    email: "grace@example.com",
    initials: "GH",
    amount: "$95.00",
    status: "Pending",
    date: "Feb 17, 2026",
  },
  {
    id: "ORD-1022",
    customer: "Claude Shannon",
    email: "claude@example.com",
    initials: "CS",
    amount: "$530.00",
    status: "Paid",
    date: "Feb 17, 2026",
  },
  {
    id: "ORD-1021",
    customer: "Alan Turing",
    email: "alan@example.com",
    initials: "AT",
    amount: "$180.00",
    status: "Failed",
    date: "Feb 16, 2026",
  },
  {
    id: "ORD-1020",
    customer: "Lise Meitner",
    email: "lise@example.com",
    initials: "LM",
    amount: "$320.00",
    status: "Paid",
    date: "Feb 15, 2026",
  },
  {
    id: "ORD-1019",
    customer: "Rosalind Franklin",
    email: "ros@example.com",
    initials: "RF",
    amount: "$75.00",
    status: "Pending",
    date: "Feb 14, 2026",
  },
];

const team = [
  { name: "Ada Lovelace", role: "Lead Designer", initials: "AL", status: "Active" },
  { name: "Grace Hopper", role: "Senior Engineer", initials: "GH", status: "Active" },
  { name: "Claude Shannon", role: "Data Scientist", initials: "CS", status: "Away" },
  { name: "Alan Turing", role: "Backend Engineer", initials: "AT", status: "Active" },
];

function statusVariant(status: string) {
  if (status === "Paid" || status === "Active") return "default" as const;
  if (status === "Pending" || status === "Away") return "secondary" as const;
  return "destructive" as const;
}

function Dashboard() {
  return (
    <div className="py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Heading level={1} className="mb-1">
            Dashboard
          </Heading>
          <Typography variant="muted">Welcome back. Here&apos;s what&apos;s happening.</Typography>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <Badge
                variant={stat.trend === "up" ? "default" : "destructive"}
                className="mt-2 text-xs"
              >
                {stat.delta}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="mb-8" />

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>6 orders in the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-xs">{order.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm leading-none font-medium">{order.customer}</p>
                            <p className="text-muted-foreground mt-0.5 text-xs">{order.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body-sm" className="text-muted-foreground">
                          {order.date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{order.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>{team.length} members</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map((member) => (
                    <TableRow key={member.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body-sm" className="text-muted-foreground">
                          {member.role}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(member.status)}>{member.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

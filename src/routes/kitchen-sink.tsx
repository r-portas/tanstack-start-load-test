import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Badge } from "src/components/ui/badge";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Input } from "src/components/ui/input";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { Display, Heading, Lead, Typography } from "src/components/ui/typography";

export const Route = createFileRoute("/kitchen-sink")({
  component: KitchenSink,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10">
      <Heading level={2} className="mb-6">
        {title}
      </Heading>
      {children}
    </section>
  );
}

function KitchenSink() {
  return (
    <div className="py-10">
      <Display className="mb-3">Kitchen Sink</Display>
      <Lead className="mb-2">
        A visual reference for all components and typography in this theme.
      </Lead>
      <Typography variant="muted">
        Use this page to tweak styles in{" "}
        <code className="bg-card rounded p-1 font-mono text-xs">global.css</code> and see changes
        immediately.
      </Typography>

      <Separator className="mt-8" />

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-4">
          <Display>Display — The quick brown fox</Display>
          <Heading level={1}>Heading 1 — The quick brown fox</Heading>
          <Heading level={2}>Heading 2 — The quick brown fox</Heading>
          <Heading level={3}>Heading 3 — The quick brown fox</Heading>
          <Heading level={4}>Heading 4 — The quick brown fox</Heading>
          <Heading level={5}>Heading 5 — The quick brown fox</Heading>
          <Heading level={6}>Heading 6 — The quick brown fox</Heading>
          <Separator />
          <Lead>
            Lead — Introductory paragraph text, slightly larger and muted to ease readers in.
          </Lead>
          <Typography>
            Body — The default body text size used across the application for readable prose.
          </Typography>
          <Typography variant="body-sm">
            Body SM — Slightly smaller body text for secondary content and metadata.
          </Typography>
          <Typography variant="muted">
            Muted — Subdued text for supporting information, timestamps, and captions.
          </Typography>
          <Typography variant="caption">
            Caption — Small serif text for figure labels, photo credits, and annotations.
          </Typography>
        </div>
      </Section>

      <Separator />

      {/* Buttons */}
      <Section title="Buttons">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">Large</Button>
            <Button size="default">Default</Button>
            <Button size="sm">Small</Button>
            <Button size="xs">XSmall</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled outline
            </Button>
          </div>
        </div>
      </Section>

      <Separator />

      {/* Form Controls */}
      <Section title="Form Controls">
        <div className="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
          <Input type="email" placeholder="Email address" />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option-1">Option 1</SelectItem>
              <SelectItem value="option-2">Option 2</SelectItem>
              <SelectItem value="option-3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Separator />

      {/* Cards */}
      <Section title="Cards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Supporting description text for the card.</CardDescription>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="body-sm">
                Card body content. Use cards to group related information and actions.
              </Typography>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Action</Button>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>This month</CardDescription>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$12,400</p>
              <Typography variant="muted" className="mt-1">
                +8.2% from last month
              </Typography>
            </CardContent>
          </Card>
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Active</Badge>
              <Badge variant="secondary">Pending</Badge>
              <Badge variant="outline">Draft</Badge>
              <Badge variant="destructive">Error</Badge>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Separator />

      {/* Badges */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Section>

      <Separator />

      {/* Tabs */}
      <Section title="Tabs">
        <Tabs defaultValue="overview" className="max-w-lg">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-4">
            <Typography>
              Overview tab content. Tabs are useful for switching between related views.
            </Typography>
          </TabsContent>
          <TabsContent value="analytics" className="pt-4">
            <Typography>Analytics tab content.</Typography>
          </TabsContent>
          <TabsContent value="settings" className="pt-4">
            <Typography>Settings tab content.</Typography>
          </TabsContent>
        </Tabs>
      </Section>

      <Separator />

      {/* Avatars */}
      <Section title="Avatars">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src="https://github.com/r-portas.png" alt="r-portas" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar className="size-10">
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar className="size-8">
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <Avatar className="size-6">
            <AvatarFallback>EF</AvatarFallback>
          </Avatar>
        </div>
      </Section>

      <Separator />

      {/* Table */}
      <Section title="Table">
        <Table>
          <TableCaption>A sample data table showing invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: "INV-001", status: "Paid", method: "Credit Card", amount: "$250.00" },
              { id: "INV-002", status: "Pending", method: "Bank Transfer", amount: "$150.00" },
              { id: "INV-003", status: "Failed", method: "PayPal", amount: "$350.00" },
              { id: "INV-004", status: "Paid", method: "Credit Card", amount: "$450.00" },
            ].map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === "Paid"
                        ? "default"
                        : row.status === "Pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell className="text-right">{row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </div>
  );
}

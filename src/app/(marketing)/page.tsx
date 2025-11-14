import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  LayoutDashboard,
  Palette,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "Composable design tokens",
    description:
      "Theme every surface with CSS variables that mirror your design system. Light and dark palettes stay perfectly in sync.",
    icon: Palette,
    badge: "Styling",
  },
  {
    title: "Production-ready UI primitives",
    description:
      "Build onboarding flows, dashboards, and marketing sites with the shadcn/ui component suite—all typed and accessible.",
    icon: LayoutDashboard,
    badge: "Components",
  },
  {
    title: "Secure-by-default foundations",
    description:
      "Pre-configured ESLint, TypeScript, and security headers keep the baseline tight while you ship features faster.",
    icon: ShieldCheck,
    badge: "Quality",
  },
];

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:px-10 lg:px-16">
        <section className="flex flex-col gap-6">
          <Badge className="w-fit gap-2 text-xs uppercase tracking-wide">
            Next.js 15 · React 19 ready
            <span className="inline-flex items-center">
              <Check className="h-3 w-3" />
            </span>
          </Badge>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Production-grade design system starter.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Opinionated defaults for teams shipping on Next.js App Router:
                token-driven theming, accessible shadcn/ui primitives, and a
                resilient toolchain that scales with your product roadmap.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/sign-in">
                    Explore dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/sign-in">
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="https://ui.shadcn.com/" target="_blank">
                    Component recipes
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="gap-2 px-4 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  View rollout roadmap
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] space-y-3 text-sm">
                <p className="font-medium text-muted-foreground">
                  Upcoming drops
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span>Auth flows &amp; on-ramps</span>
                    <Badge variant="secondary">Dec</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Workflow dashboards</span>
                    <Badge variant="outline">Jan</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Payments &amp; billing guardrails</span>
                    <Badge variant="outline">Feb</Badge>
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon, badge }) => (
            <Card key={title} className="flex flex-col justify-between">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  {badge}
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="link" className="px-0" asChild>
                        <Link
                          href="https://github.com/shadcn-ui/ui"
                          target="_blank"
                        >
                          Implementation guide
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View the reference kit</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Skeleton className="h-9 w-24 rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Shape your workspace</CardTitle>
              <CardDescription>
                Configure product areas, UI density, and design tokens before
                inviting your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Workspace name</Label>
                  <Input
                    id="workspace-name"
                    placeholder="Acme Design Ops"
                    autoComplete="organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surface-density">Surface density</Label>
                  <Select defaultValue="compact">
                    <SelectTrigger id="surface-density">
                      <SelectValue placeholder="Pick a density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="condensed">Condensed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roadmap">Objectives</Label>
                <Textarea
                  id="roadmap"
                  placeholder="Outline immediate goals for this workspace…"
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline">Preview theme</Button>
              <Button asChild>
                <Link href="/sign-in">
                  Create workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle>UI snapshot</CardTitle>
              <CardDescription>
                Generated with the exact tokens and components that ship in this
                template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Primary button</p>
                  <p className="text-xs text-muted-foreground">
                    Hover + focus behavior wired in
                  </p>
                </div>
                <Button size="sm" className="min-w-[140px]">
                  Launch configuration
                </Button>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Team contact</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="founders@acme.com"
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Next.js App Router</Badge>
                <Badge variant="secondary">Tailwind CSS v4</Badge>
                <Badge variant="secondary">shadcn/ui</Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}


# Bonus Module: Analytics Dashboard

## Prerequisites

**✅ Required before starting:**

- Core CRM complete with CRUD operations
- AI features implemented (summaries, scoring, recommendations)
- Lead and interaction data exists in database
- Comfortable with data visualization concepts

**If missing prerequisites:** Complete Days 1-2 required features first.

---

## What You'll Build

**A comprehensive analytics dashboard with:**

1. **Lead Pipeline Visualization** - Funnel chart showing lead stages and conversion rates
2. **Activity Trends** - Line chart showing interactions over time
3. **Conversion Metrics** - KPI cards with key numbers
4. **AI Scoring Distribution** - Bar chart showing score distribution
5. **Budget Analysis** - Pie chart showing budget allocation

**Dashboard layout:**

```
+--------------------------------------------------+
| Analytics Dashboard                              |
+--------------------------------------------------+
| [Total Leads] [Active Tasks] [Conversion Rate]  | ← KPI Cards
+--------------------------------------------------+
| Lead Pipeline Funnel          | Activity Trends | ← Charts (row 1)
+--------------------------------------------------+
| AI Score Distribution         | Budget Analysis | ← Charts (row 2)
+--------------------------------------------------+
```

---

## Implementation Guide

### Phase 1: Install Dependencies (5 minutes)

**Install chart library (Recharts):**

```bash
cd ~/auggie-academy-<your-name>/frontend
pnpm add recharts
pnpm add -D @types/recharts
```

**Why Recharts?**

- React-first (declarative API)
- Responsive by default
- Good TypeScript support
- Covers all chart types we need

---

### Phase 2: Backend Analytics Queries (30-45 minutes)

#### Create analytics resolver:

**File:** `backend/src/analytics/analytics.resolver.ts`

```typescript
import { Resolver, Query } from "@nestjs/graphql";
import { AnalyticsService } from "./analytics.service";

@Resolver()
export class AnalyticsResolver {
  constructor(private analyticsService: AnalyticsService) {}

  @Query(() => AnalyticsData)
  async analytics() {
    return this.analyticsService.getAnalytics();
  }

  @Query(() => [PipelineStageData])
  async pipelineData() {
    return this.analyticsService.getPipelineData();
  }

  @Query(() => [ActivityTrendData])
  async activityTrends(@Args("days", { defaultValue: 30 }) days: number) {
    return this.analyticsService.getActivityTrends(days);
  }

  @Query(() => [ScoreDistributionData])
  async scoreDistribution() {
    return this.analyticsService.getScoreDistribution();
  }

  @Query(() => [BudgetData])
  async budgetAnalysis() {
    return this.analyticsService.getBudgetAnalysis();
  }
}
```

---

#### Create analytics service with aggregation queries:

**File:** `backend/src/analytics/analytics.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lead } from "../leads/entities/lead.entity";
import { Interaction } from "../interactions/entities/interaction.entity";
import { Task } from "../tasks/entities/task.entity";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Interaction)
    private interactionRepository: Repository<Interaction>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>
  ) {}

  async getAnalytics() {
    const totalLeads = await this.leadRepository.count();
    const activeLeads = await this.leadRepository.count({
      where: { status: "active" },
    });
    const activeTasks = await this.taskRepository.count({
      where: { status: "pending" },
    });
    const convertedLeads = await this.leadRepository.count({
      where: { status: "closed_won" },
    });

    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      activeLeads,
      activeTasks,
      convertedLeads,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  async getPipelineData() {
    // Group leads by status (pipeline stage)
    const result = await this.leadRepository
      .createQueryBuilder("lead")
      .select("lead.status", "stage")
      .addSelect("COUNT(*)", "count")
      .groupBy("lead.status")
      .getRawMany();

    // Calculate conversion rates between stages
    const totalLeads = await this.leadRepository.count();

    return result.map((row) => ({
      stage: row.stage,
      count: parseInt(row.count),
      percentage: totalLeads > 0 ? (parseInt(row.count) / totalLeads) * 100 : 0,
    }));
  }

  async getActivityTrends(days: number) {
    // Get interactions grouped by date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.interactionRepository
      .createQueryBuilder("interaction")
      .select("DATE(interaction.date)", "date")
      .addSelect("COUNT(*)", "count")
      .where("interaction.date >= :startDate", { startDate })
      .groupBy("DATE(interaction.date)")
      .orderBy("DATE(interaction.date)", "ASC")
      .getRawMany();

    return result.map((row) => ({
      date: row.date,
      count: parseInt(row.count),
    }));
  }

  async getScoreDistribution() {
    // Group leads by activity score ranges
    const result = await this.leadRepository
      .createQueryBuilder("lead")
      .select(
        `CASE
          WHEN lead.activityScore >= 80 THEN 'High (80-100)'
          WHEN lead.activityScore >= 60 THEN 'Medium (60-79)'
          WHEN lead.activityScore >= 40 THEN 'Low (40-59)'
          ELSE 'Very Low (0-39)'
        END`,
        "range"
      )
      .addSelect("COUNT(*)", "count")
      .where("lead.activityScore IS NOT NULL")
      .groupBy("range")
      .getRawMany();

    return result.map((row) => ({
      range: row.range,
      count: parseInt(row.count),
    }));
  }

  async getBudgetAnalysis() {
    // Group leads by budget ranges
    const result = await this.leadRepository
      .createQueryBuilder("lead")
      .select(
        `CASE
          WHEN lead.budget >= 100000 THEN 'Enterprise (100k+)'
          WHEN lead.budget >= 50000 THEN 'Large (50-100k)'
          WHEN lead.budget >= 10000 THEN 'Medium (10-50k)'
          ELSE 'Small (<10k)'
        END`,
        "range"
      )
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(lead.budget)", "total")
      .where("lead.budget IS NOT NULL")
      .groupBy("range")
      .getRawMany();

    return result.map((row) => ({
      range: row.range,
      count: parseInt(row.count),
      total: parseFloat(row.total),
    }));
  }
}
```

---

#### Create GraphQL types:

**File:** `backend/src/analytics/dto/analytics.types.ts`

```typescript
import { ObjectType, Field, Float, Int } from "@nestjs/graphql";

@ObjectType()
export class AnalyticsData {
  @Field(() => Int)
  totalLeads: number;

  @Field(() => Int)
  activeLeads: number;

  @Field(() => Int)
  activeTasks: number;

  @Field(() => Int)
  convertedLeads: number;

  @Field(() => Float)
  conversionRate: number;
}

@ObjectType()
export class PipelineStageData {
  @Field()
  stage: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class ActivityTrendData {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class ScoreDistributionData {
  @Field()
  range: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class BudgetData {
  @Field()
  range: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  total: number;
}
```

---

### Phase 3: Frontend Dashboard

#### Create analytics queries:

**File:** `frontend/src/apollo/queries/analytics.ts`

```typescript
import { gql } from "@apollo/client";

export const GET_ANALYTICS = gql`
  query GetAnalytics {
    analytics {
      totalLeads
      activeLeads
      activeTasks
      convertedLeads
      conversionRate
    }
  }
`;

export const GET_PIPELINE_DATA = gql`
  query GetPipelineData {
    pipelineData {
      stage
      count
      percentage
    }
  }
`;

export const GET_ACTIVITY_TRENDS = gql`
  query GetActivityTrends($days: Int!) {
    activityTrends(days: $days) {
      date
      count
    }
  }
`;

export const GET_SCORE_DISTRIBUTION = gql`
  query GetScoreDistribution {
    scoreDistribution {
      range
      count
    }
  }
`;

export const GET_BUDGET_ANALYSIS = gql`
  query GetBudgetAnalysis {
    budgetAnalysis {
      range
      count
      total
    }
  }
`;
```

---

#### Create KPI card component:

**File:** `frontend/src/components/KPICard.tsx`

```typescript
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon, trend }: KPICardProps) {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
            {title}
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "#333" }}>
            {value}
          </div>
          {trend && (
            <div
              style={{
                fontSize: "12px",
                color: trend.isPositive ? "#10b981" : "#ef4444",
                marginTop: "4px",
              }}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}%
            </div>
          )}
        </div>
        {icon && <div style={{ fontSize: "48px", opacity: 0.2 }}>{icon}</div>}
      </div>
    </div>
  );
}
```

---

#### Create dashboard page:

**File:** `frontend/src/pages/Analytics.tsx`

```typescript
import { useQuery } from "@apollo/client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { KPICard } from "../components/KPICard";
import {
  GET_ANALYTICS,
  GET_PIPELINE_DATA,
  GET_ACTIVITY_TRENDS,
  GET_SCORE_DISTRIBUTION,
  GET_BUDGET_ANALYSIS,
} from "../apollo/queries/analytics";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function Analytics() {
  const { data: analyticsData } = useQuery(GET_ANALYTICS);
  const { data: pipelineData } = useQuery(GET_PIPELINE_DATA);
  const { data: trendsData } = useQuery(GET_ACTIVITY_TRENDS, {
    variables: { days: 30 },
  });
  const { data: scoreData } = useQuery(GET_SCORE_DISTRIBUTION);
  const { data: budgetData } = useQuery(GET_BUDGET_ANALYSIS);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: "24px" }}>Analytics Dashboard</h1>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <KPICard
          title="Total Leads"
          value={analyticsData?.analytics.totalLeads || 0}
        />
        <KPICard
          title="Active Leads"
          value={analyticsData?.analytics.activeLeads || 0}
        />
        <KPICard
          title="Active Tasks"
          value={analyticsData?.analytics.activeTasks || 0}
        />
        <KPICard
          title="Conversion Rate"
          value={`${analyticsData?.analytics.conversionRate || 0}%`}
        />
      </div>

      {/* Charts Row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Pipeline Funnel */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Lead Pipeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData?.pipelineData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Trends */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Activity Trends (30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsData?.activityTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Score Distribution */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>AI Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreData?.scoreDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Analysis */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Budget Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetData?.budgetAnalysis || []}
                dataKey="count"
                nameKey="range"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(budgetData?.budgetAnalysis || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

---

#### Add route for analytics:

**File:** `frontend/src/App.tsx`

```typescript
import { Analytics } from "./pages/Analytics";

<Routes>
  {/* ... existing routes ... */}
  <Route path="/analytics" element={<Analytics />} />
</Routes>;
```

---

#### Add navigation link:

**File:** `frontend/src/components/Navigation.tsx`

```typescript
<nav>
  <Link to="/dashboard">Dashboard</Link>
  <Link to="/analytics">Analytics</Link> {/* Add this */}
  <Link to="/tasks">Tasks</Link>
</nav>
```

---

### Phase 4: Advanced Features (Optional, +30-60 minutes)

#### Add date range filter:

```typescript
const [dateRange, setDateRange] = useState(30); // days

const { data: trendsData } = useQuery(GET_ACTIVITY_TRENDS, {
  variables: { days: dateRange },
});

<select
  value={dateRange}
  onChange={(e) => setDateRange(Number(e.target.value))}
>
  <option value={7}>Last 7 days</option>
  <option value={30}>Last 30 days</option>
  <option value={90}>Last 90 days</option>
</select>;
```

#### Add export to CSV:

```typescript
function exportToCSV(data: any[], filename: string) {
  const csv = [
    Object.keys(data[0]).join(","),
    ...data.map((row) => Object.values(row).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

<button
  onClick={() => exportToCSV(pipelineData.pipelineData, "pipeline-data.csv")}
>
  Export to CSV
</button>;
```

#### Add real-time updates:

```typescript
// Poll for updates every 30 seconds
const { data } = useQuery(GET_ANALYTICS, {
  pollInterval: 30000,
});
```

---

## Testing

### Manual testing:

```bash
cd ~/auggie-academy-<your-name>

# Start backend and frontend
# Terminal 1
cd backend && pnpm run start:dev

# Terminal 2
cd frontend && pnpm run dev
```

**Test dashboard:**

1. Navigate to `/analytics`
2. Verify KPI cards show correct numbers
3. Verify charts display data
4. Test date range filter (if implemented)
5. Test export to CSV (if implemented)

---

### Automated testing:

**Test analytics service:**

**File:** `backend/src/analytics/analytics.service.spec.ts`

```typescript
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AnalyticsService } from "./analytics.service";
import { Lead } from "../leads/entities/lead.entity";

describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let leadRepository: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        // ... other repositories
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    leadRepository = module.get(getRepositoryToken(Lead));
  });

  it("should calculate analytics correctly", async () => {
    leadRepository.count.mockResolvedValueOnce(100); // totalLeads
    leadRepository.count.mockResolvedValueOnce(80); // activeLeads
    // ... mock other counts

    const result = await service.getAnalytics();

    expect(result.totalLeads).toBe(100);
    expect(result.activeLeads).toBe(80);
  });
});
```

---

### Run validation gates:

```bash
cd ~/auggie-academy-<your-name>

pnpm run type-check  # 0 errors
pnpm run lint        # 0 warnings
pnpm test            # All passing
# Check processes
# Browser test: Dashboard displays
```

---

## Performance Optimization

### Caching expensive queries:

```typescript
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class AnalyticsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getAnalytics() {
    const cacheKey = "analytics_data";
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.computeAnalytics();

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, data, 300);

    return data;
  }
}
```

### Pagination for large datasets:

```typescript
async getActivityTrends(days: number, limit: number = 100) {
  // ... query with LIMIT
  .limit(limit)
  .getRawMany();
}
```

---

## Expected Outcomes

**After completing this module:**

- ✅ Complete analytics dashboard with 4+ charts
- ✅ KPI cards showing key metrics
- ✅ Lead pipeline visualization (funnel/bar chart)
- ✅ Activity trends over time (line chart)
- ✅ AI score distribution (bar chart)
- ✅ Budget analysis (pie chart)
- ✅ All validation gates passing
- ✅ Tested in browser

**Skills learned:**

- Data aggregation queries (SQL grouping)
- Chart library integration (Recharts)
- Dashboard layout and design
- Performance optimization (caching)
- Data visualization best practices

**Transferable to company work:**

- Business intelligence dashboards
- Data visualization
- Analytics queries
- Report generation
- KPI tracking

---

## Troubleshooting

**Charts not rendering:**

- Check console for errors
- Verify data format matches chart expected format
- Ensure ResponsiveContainer has parent with defined height

**GraphQL query errors:**

- Verify backend resolver returns correct types
- Check database has data (seed if empty)
- Test queries in GraphQL playground

**Performance issues with large datasets:**

- Add indexes to frequently queried columns
- Implement caching for expensive queries
- Add pagination/limits to queries
- Consider database views for complex aggregations

**Empty charts:**

- Verify database has data
- Check date ranges (not filtering out all data)
- Test queries directly in database
- Add loading states to show when data is fetching

---

**✅ Bonus Module: Analytics Dashboard**

**Back to:** [Bonus Modules Overview](README.md)

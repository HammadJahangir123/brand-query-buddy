import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const brands = [
  { name: "Bareeze/Home Expression", sbsNo: 2 },
  { name: "Bareeze Men", sbsNo: 3 },
  { name: "Chinyere", sbsNo: 5 },
  { name: "Minnie Minor", sbsNo: 7 },
  { name: "Rang Ja", sbsNo: 8 },
  { name: "The Entertainer", sbsNo: 12 },
];

const QueryBuilder = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [storeCode, setStoreCode] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [generatedQuery, setGeneratedQuery] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generateQuery = () => {
    if (!selectedBrand || !storeCode || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    const brand = brands.find((b) => b.name === selectedBrand);
    if (!brand) return;

    const formattedDate = format(date, "dd-MM-yyyy");

    const query = `select count(*), 'Invoices' as cat from invoice where store_no=${storeCode} and sbs_no=${brand.sbsNo} and held not in (1) and invc_type not in (7) and created_date >= to_date('${formattedDate}','dd-mm-yyyy')
union all
select count(*), 'Slip out' as cat from slip where out_store_no=${storeCode} and sbs_no=${brand.sbsNo} and held not in (1) and created_date >= to_date('${formattedDate}','dd-mm-yyyy')
union all
select count(*), 'Slip in' as cat from slip where in_store_no=${storeCode} and sbs_no=${brand.sbsNo} and held not in (1) and created_date >= to_date('${formattedDate}','dd-mm-yyyy')
union all
select count(*), 'Voucher' as cat from voucher where store_no=${storeCode} and sbs_no=${brand.sbsNo} and held not in (1) and vou_class not in (2) and created_date >= to_date('${formattedDate}','dd-mm-yyyy')`;

    setGeneratedQuery(query);
    toast.success("Query generated successfully!");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedQuery);
      setCopied(true);
      toast.success("Query copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy query");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Database Query Builder
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate SQL queries for TechTool Kit database operations
          </p>
        </div>

        <Card className="p-6 md:p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {brands.map((brand) => (
                    <SelectItem key={brand.sbsNo} value={brand.name}>
                      {brand.name} (SBS: {brand.sbsNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-code">Store Code</Label>
              <Input
                id="store-code"
                type="text"
                placeholder="e.g., 126"
                value={storeCode}
                onChange={(e) => setStoreCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd-MM-yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button onClick={generateQuery} className="w-full md:w-auto" size="lg">
            Generate Query
          </Button>
        </Card>

        {generatedQuery && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Generated Query
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-lg bg-code-bg p-4 overflow-x-auto">
              <pre className="text-sm text-code-foreground font-mono whitespace-pre-wrap">
                {generatedQuery}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QueryBuilder;

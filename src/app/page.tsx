'use client';

import { useState, useEffect } from 'react';
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/badge';
import { Heading, Subheading } from '@/components/heading';
import { Stat } from '@/components/stat';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';

interface FormData {
  id: number;
  name: string;
  category: string;
  governingBody: string;
  description: string;
  resourceUrl: string;
  jurisdiction: string;
  frequency: string;
  status: string;
  due_date?: string;
  featured: boolean;
  sections?: Record<string, any>;
}

const calculateProgress = (dueDate?: string): number => {
  if (!dueDate) return 0;
  
  const now = new Date();
  const due = new Date(dueDate);
  const timeLeft = due.getTime() - now.getTime();
  const daysLeft = timeLeft / (1000 * 3600 * 24);
  
  if (daysLeft < 0) return 100;  // Past due
  if (daysLeft <= 30) {
    return Math.round(100 - (daysLeft / 30 * 100));
  }
  return 40;
};

export default function Home() {
  const [forms, setForms] = useState<Record<string, FormData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ 
    key: keyof FormData; 
    direction: 'ascending' | 'descending' 
  } | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch('/api/forms');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setForms(data);
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError(err instanceof Error ? err.message : 'Failed to load forms');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleSort = (key: keyof FormData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formsList = Object.entries(forms).map(([key, form]) => ({
    key,
    ...form
  }));

  const sortedForms = [...formsList].sort((a, b) => {
    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      // Handle potential undefined due_dates
      if (key === 'due_date') {
        const aValue = a[key] || '';
        const bValue = b[key] || '';
        return direction === 'ascending' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      // Handle regular sorting
      const aValue = String(a[key]).toLowerCase();
      const bValue = String(b[key]).toLowerCase();
      return direction === 'ascending' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return 0;
  });

  const getCompletionStats = (formsList: typeof sortedForms, frequencyFilter?: string) => {
    const filteredForms = frequencyFilter 
      ? formsList.filter(form => form.frequency === frequencyFilter)
      : formsList;
    
    const total = filteredForms.length;
    const completed = filteredForms.filter(form => {
      if (!form.due_date) return false;
      return calculateProgress(form.due_date) >= 90;
    }).length;
    
    return { completed, total };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading forms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  const allStats = getCompletionStats(sortedForms);
  const onceStats = getCompletionStats(sortedForms, 'Once');
  const annualStats = getCompletionStats(sortedForms, 'Annual');
  const miscStats = getCompletionStats(sortedForms, 'Miscellaneous');

  return (
    <>
      <Heading>Forms Dashboard</Heading>

      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
      </div>

      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat 
          title="All Forms" 
          value={`${allStats.completed} of ${allStats.total}`}
          change="completed" 
        />
        <Stat 
          title="One-time Forms" 
          value={`${onceStats.completed} of ${onceStats.total}`}
          change="completed" 
        />
        <Stat 
          title="Annual Forms" 
          value={`${annualStats.completed} of ${annualStats.total}`}
          change="completed" 
        />
        <Stat 
          title="Miscellaneous Forms" 
          value={`${miscStats.completed} of ${miscStats.total}`}
          change="completed" 
        />
      </div>

      <Subheading className="mt-14">Form Progress</Subheading>
      
      <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            {["name", "category", "frequency", "status", "progress", "due_date"].map((key) => (
              <TableHeader 
                key={key} 
                onClick={() => handleSort(key as keyof FormData)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  {key === 'due_date' ? 'Due Date' : key.charAt(0).toUpperCase() + key.slice(1)}
                  <ArrowsUpDownIcon
                    className={`w-4 h-4 ${
                      sortConfig?.key === key
                        ? sortConfig.direction === 'ascending'
                          ? 'rotate-180 text-blue-500'
                          : 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedForms.map((form) => {
            const progress = calculateProgress(form.due_date);
            return (
              <TableRow key={form.key} href={`/forms/${form.key}`}>
                <TableCell className="font-medium">{form.name}</TableCell>
                <TableCell className="text-zinc-500">
                  {form.category}
                </TableCell>
                <TableCell className="text-zinc-500">
                  {form.frequency}
                </TableCell>
                <TableCell>
                  <Badge 
                    color={form.status.toLowerCase() === 'required' ? 'red' : 
                           form.status.toLowerCase() === 'optional' ? 'lime' : 'amber'}
                  >
                    {form.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-zinc-100">
                      <div 
                        className={`h-full rounded-full ${
                          progress >= 90 ? 'bg-green-500' :
                          progress >= 70 ? 'bg-lime-500' :
                          progress >= 30 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-zinc-600">{progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500">
                  {form.due_date ? new Date(form.due_date).toLocaleDateString() : 'No deadline'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
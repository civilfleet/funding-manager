"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, GripVertical, Save, Eye, Settings } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { FieldType, FormSection, FormField as FormFieldType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const fieldOptionSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
});

const formFieldSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "Key is required").regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Key must be a valid identifier"),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  type: z.nativeEnum(FieldType),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  isRequired: z.boolean(),
  order: z.number(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  pattern: z.string().optional(),
  options: z.array(fieldOptionSchema).optional(),
});

const formSectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Section name is required"),
  description: z.string().optional(),
  order: z.number(),
  fields: z.array(formFieldSchema),
});

const formConfigSchema = z.object({
  sections: z.array(formSectionSchema),
});

type FormConfigValues = z.infer<typeof formConfigSchema>;

interface FormConfigurationManagerProps {
  teamId: string;
}

export default function FormConfigurationManager({ teamId }: FormConfigurationManagerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const form = useForm<FormConfigValues>({
    resolver: zodResolver(formConfigSchema),
    defaultValues: {
      sections: [],
    },
  });

  const { fields: sections, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  useEffect(() => {
    loadFormConfiguration();
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFormConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/form-config`);
      if (response.ok) {
        const data = await response.json();
        if (data.sections && data.sections.length > 0) {
          form.reset({ sections: data.sections });
          // Open all sections by default
          const openState = data.sections.reduce((acc: Record<string, boolean>, section: FormSection, index: number) => {
            acc[`section-${index}`] = true;
            return acc;
          }, {});
          setOpenSections(openState);
        } else {
          // Load default configuration if none exists
          loadDefaultConfiguration();
        }
      } else {
        loadDefaultConfiguration();
      }
    } catch (error) {
      console.error("Failed to load form configuration:", error);
      loadDefaultConfiguration();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultConfiguration = () => {
    const defaultSections = [
      {
        name: "Basic Information",
        description: "Essential project details",
        order: 1,
        fields: [
          {
            key: "name",
            label: "Project Name",
            description: "Provide a clear, concise name for your funding request",
            type: FieldType.TEXT,
            placeholder: "Enter the name of your project",
            isRequired: true,
            order: 1,
            minLength: 3,
          },
          {
            key: "amountRequested",
            label: "Amount Requested",
            type: FieldType.NUMBER,
            placeholder: "0.00",
            isRequired: true,
            order: 2,
            minValue: 0,
          },
          {
            key: "expectedCompletionDate",
            label: "Expected Completion Date",
            type: FieldType.DATE,
            isRequired: true,
            order: 3,
          },
        ],
      },
      {
        name: "Project Details",
        description: "Detailed information about your project",
        order: 2,
        fields: [
          {
            key: "description",
            label: "Project Description",
            description: "Explain what your project is about and why it matters",
            type: FieldType.TEXTAREA,
            placeholder: "Provide a detailed description of your project",
            isRequired: true,
            order: 1,
            minLength: 10,
          },
          {
            key: "purpose",
            label: "Project Purpose",
            description: "Clearly state the objectives and intended outcomes",
            type: FieldType.TEXTAREA,
            placeholder: "Describe the purpose and goals of your project",
            isRequired: true,
            order: 2,
            minLength: 10,
          },
        ],
      },
      {
        name: "Financial Planning",
        description: "Financial sustainability and planning details",
        order: 3,
        fields: [
          {
            key: "refinancingConcept",
            label: "Refinancing Concept",
            description: "Detail how the project will be financially sustainable after initial funding",
            type: FieldType.TEXTAREA,
            placeholder: "Explain your refinancing strategy",
            isRequired: true,
            order: 1,
            minLength: 10,
          },
          {
            key: "sustainability",
            label: "Sustainability Plan",
            description: "Outline the long-term viability and impact of your project",
            type: FieldType.TEXTAREA,
            placeholder: "Describe how your project will be sustainable in the long term",
            isRequired: true,
            order: 2,
            minLength: 10,
          },
        ],
      },
    ];

    form.reset({ sections: defaultSections });
    const openState = defaultSections.reduce((acc: Record<string, boolean>, _, index) => {
      acc[`section-${index}`] = true;
      return acc;
    }, {});
    setOpenSections(openState);
  };

  const addSection = () => {
    appendSection({
      name: "New Section",
      description: "",
      order: sections.length + 1,
      fields: [],
    });
  };

  const addField = (sectionIndex: number) => {
    const currentFields = form.getValues(`sections.${sectionIndex}.fields`) || [];
    const newField = {
      key: `field_${currentFields.length + 1}`,
      label: "New Field",
      type: FieldType.TEXT,
      isRequired: false,
      order: currentFields.length + 1,
    };
    
    form.setValue(`sections.${sectionIndex}.fields`, [...currentFields, newField]);
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const currentFields = form.getValues(`sections.${sectionIndex}.fields`);
    const updatedFields = currentFields.filter((_, index) => index !== fieldIndex);
    form.setValue(`sections.${sectionIndex}.fields`, updatedFields);
  };

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const onSubmit = async (values: FormConfigValues) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/form-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to save form configuration");
      }

      toast({
        title: "Configuration Saved",
        description: "Form configuration has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save form configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading form configuration...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Funding Request Form Configuration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize the fields and sections that appear in your funding request forms
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {sections.map((section, sectionIndex) => {
                const sectionKey = `section-${sectionIndex}`;
                const isOpen = openSections[sectionKey];
                
                return (
                  <Card key={section.id || sectionIndex} className="border-dashed">
                    <Collapsible open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <h3 className="font-medium">
                                  {form.watch(`sections.${sectionIndex}.name`) || "Unnamed Section"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {form.watch(`sections.${sectionIndex}.fields`)?.length || 0} fields
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Section {sectionIndex + 1}</Badge>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSection(sectionIndex);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name={`sections.${sectionIndex}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Section Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Basic Information" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`sections.${sectionIndex}.order`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Order</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`sections.${sectionIndex}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Brief description of this section"
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Separator />
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Fields</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addField(sectionIndex)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Field
                              </Button>
                            </div>
                            
                            {form.watch(`sections.${sectionIndex}.fields`)?.map((field, fieldIndex) => (
                              <Card key={fieldIndex} className="border border-border">
                                <CardContent className="pt-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="secondary">Field {fieldIndex + 1}</Badge>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeField(sectionIndex, fieldIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                      control={form.control}
                                      name={`sections.${sectionIndex}.fields.${fieldIndex}.key`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Field Key</FormLabel>
                                          <FormControl>
                                            <Input placeholder="field_name" {...field} />
                                          </FormControl>
                                          <FormDescription>
                                            Unique identifier (no spaces, underscore allowed)
                                          </FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`sections.${sectionIndex}.fields.${fieldIndex}.label`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Label</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Field Label" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`sections.${sectionIndex}.fields.${fieldIndex}.type`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Field Type</FormLabel>
                                          <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select field type" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {Object.values(FieldType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                  {type.replace("_", " ")}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`sections.${sectionIndex}.fields.${fieldIndex}.isRequired`}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                          <div className="space-y-0.5">
                                            <FormLabel>Required Field</FormLabel>
                                            <FormDescription>
                                              Must be filled by users
                                            </FormDescription>
                                          </div>
                                          <FormControl>
                                            <Switch
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  
                                  <FormField
                                    control={form.control}
                                    name={`sections.${sectionIndex}.fields.${fieldIndex}.description`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                          <Textarea 
                                            placeholder="Help text for this field"
                                            className="resize-none"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name={`sections.${sectionIndex}.fields.${fieldIndex}.placeholder`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Placeholder (Optional)</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter placeholder text" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={loadDefaultConfiguration}>
                  Reset to Default
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
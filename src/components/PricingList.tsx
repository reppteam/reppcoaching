import React from 'react';
import { Package, Clock, DollarSign, Edit, Copy, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

export interface CoachPricingItem {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_weeks: number;
    category: string;
    package_Features: string[];
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface PricingListProps {
    data: CoachPricingItem[];
    onEdit: (item: CoachPricingItem) => void;
    onDelete: (item: CoachPricingItem) => void;
    onDuplicate?: (item: CoachPricingItem) => void;
    onToggleStatus?: (item: CoachPricingItem) => void;
}

const PricingList: React.FC<PricingListProps> = ({ 
    data, 
    onEdit, 
    onDelete, 
    onDuplicate,
    onToggleStatus 
}) => {
    if (data.length === 0) {
        return <div className="text-center text-gray-500">No pricing packages found.</div>;
    }

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'basic': return <Package className="h-4 w-4" />;
            case 'standard': return <Package className="h-4 w-4" />;
            case 'premium': return <Package className="h-4 w-4" />;
            case 'custom': return <Package className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'basic': return 'bg-gray-100 text-gray-800';
            case 'standard': return 'bg-blue-100 text-blue-800';
            case 'premium': return 'bg-purple-100 text-purple-800';
            case 'custom': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((pkg) => (
                <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Header with status and category */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            {getCategoryIcon(pkg.category)}
                            <Badge variant="secondary" className={getCategoryColor(pkg.category)}>
                                {pkg.category}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {onToggleStatus && (
                                <Switch
                                    checked={pkg.status === 'active'}
                                    onCheckedChange={() => onToggleStatus(pkg)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            )}
                        </div>
                    </div>

                    {/* Package name and description */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{pkg.description}</p>
                    </div>

                    {/* Price and duration */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-2xl font-bold text-green-600">${pkg.price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">{pkg.duration_weeks} weeks</span>
                        </div>
                    </div>

                    {/* Features section */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Included Features:</h4>
                        <div className="space-y-1">
                            {pkg.package_Features && pkg.package_Features.length > 0 ? (
                                pkg.package_Features.map((feature: string, index: number) => (
                                    <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        {feature}
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400 italic">No features listed</div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(pkg)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        {onDuplicate && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDuplicate(pkg)}
                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            >
                                <Copy className="h-4 w-4 mr-1" />
                                Duplicate
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(pkg)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PricingList;

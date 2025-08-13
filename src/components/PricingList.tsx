import React from 'react';

export interface CoachPricingItem {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_weeks: number;
    category: string;
    packageFeatures: string;
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
}

const PricingList: React.FC<PricingListProps> = ({ data, onEdit, onDelete }) => {
    if (data.length === 0) {
        return <div className="text-center text-gray-500">No pricing packages found.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800 uppercase">
                            {pkg.status}
                        </span>
                        <span className="text-xs text-gray-500">{pkg.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{pkg.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                    <div className="text-sm text-gray-800 mb-1">
                        <strong>Price:</strong> ${pkg.price}
                    </div>
                    <div className="text-sm text-gray-800 mb-1">
                        <strong>Duration:</strong> {pkg.duration_weeks} weeks
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        <strong>Created:</strong> {new Date(pkg.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                        <strong>By:</strong> {pkg.user.email}
                    </div>

                    <div className="flex justify-end space-x-2 pt-3">
                        <button className="text-sm text-blue-600" onClick={() => onEdit(pkg)}>
                            Edit
                        </button>
                        <button className="text-sm text-red-600" onClick={() => onDelete(pkg)}>
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PricingList;

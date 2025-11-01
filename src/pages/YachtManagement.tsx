import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye, Filter, Download, Upload } from 'lucide-react';
import { Yacht } from '@/types';

// Mock data - in a real app, this would come from an API
const mockYachts: Yacht[] = [
  {
    id: 'y1',
    name: 'Ocean Dream',
    description: 'Luxury motor yacht with modern amenities',
    main_image: '/yacht1.jpg',
    capacity: 12,
    length: 65,
    price_per_hour: 1500,
    price_per_day: 10000,
    is_available: true,
    features: ['Luxury Cabin', 'Sun Deck', 'Jacuzzi', 'Water Sports'],
    location: 'Marina Bay, Dubai',
  },
  {
    id: 'y2',
    name: 'Sea Breeze',
    description: 'Elegant sailing yacht for a peaceful journey',
    main_image: '/yacht2.jpg',
    capacity: 8,
    length: 45,
    price_per_hour: 1200,
    price_per_day: 8000,
    is_available: true,
    features: ['3 Cabins', 'Dining Area', 'Fishing Equipment'],
    location: 'Palm Jumeirah, Dubai',
  },
  {
    id: 'y3',
    name: 'Royal Voyager',
    description: 'Spacious catamaran for large groups',
    main_image: '/yacht3.jpg',
    capacity: 16,
    length: 55,
    price_per_hour: 2000,
    price_per_day: 15000,
    is_available: false,
    features: ['5 Cabins', 'Lounge', 'BBQ', 'Water Slide'],
    location: 'Dubai Marina',
  },
];

export const YachtManagement = () => {
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchYachts = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/yachts');
        // const data = await response.json();
        setYachts(mockYachts);
      } catch (error) {
        console.error('Error fetching yachts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYachts();
  }, []);

  const filteredYachts = yachts.filter(yacht =>
    yacht.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    yacht.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (yacht: Yacht) => {
    setSelectedYacht(yacht);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedYacht) {
      setYachts(yachts.filter(y => y.id !== selectedYacht.id));
      setIsDeleteDialogOpen(false);
      setSelectedYacht(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yacht Management</h1>
          <p className="text-gray-600 mt-2">Manage your yacht fleet and bookings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search yachts..."
              className="pl-10 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/yachts/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Yacht
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Yacht Fleet</CardTitle>
              <CardDescription>
                {filteredYachts.length} {filteredYachts.length === 1 ? 'yacht' : 'yachts'} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Length (ft)</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Price/Hour</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredYachts.length > 0 ? (
                filteredYachts.map((yacht) => (
                  <TableRow key={yacht.id}>
                    <TableCell className="font-medium">{yacht.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden">
                          {yacht.main_image && (
                            <img
                              src={yacht.main_image}
                              alt={yacht.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span>{yacht.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{yacht.description}</TableCell>
                    <TableCell>{yacht.length} ft</TableCell>
                    <TableCell>{yacht.capacity} people</TableCell>
                    <TableCell>${yacht.price_per_hour}/hour</TableCell>
                    <TableCell>
                      <Badge variant={yacht.is_available ? 'default' : 'secondary'}>
                        {yacht.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/yachts/${yacht.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/yachts/${yacht.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(yacht)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No yachts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Yacht</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedYacht?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedYacht(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YachtManagement;

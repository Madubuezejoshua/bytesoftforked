import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Course } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Upload, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    thumbnailUrl: '',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
      setCourses(coursesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      toast.error('Failed to load courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price.toString(),
      duration: course.duration,
      level: course.level,
      thumbnailUrl: course.thumbnailUrl || '',
    });
    setImagePreview(course.thumbnailUrl || '');
    setEditDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(editingCourse?.thumbnailUrl || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setLoading(true);
    try {
      if (!formData.title.trim()) {
        toast.error('Course title is required');
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Course description is required');
        setLoading(false);
        return;
      }

      if (!formData.category.trim()) {
        toast.error('Course category is required');
        setLoading(false);
        return;
      }

      if (!formData.duration.trim()) {
        toast.error('Course duration is required');
        setLoading(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Course price must be greater than 0');
        setLoading(false);
        return;
      }

      let thumbnailUrl = formData.thumbnailUrl.trim();

      if (imageFile) {
        try {
          const storageRef = ref(storage, `course-thumbnails/${Date.now()}_${imageFile.name}`);
          await uploadBytes(storageRef, imageFile);
          thumbnailUrl = await getDownloadURL(storageRef);
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          toast.error('Failed to upload image. Please try again or use an image URL instead.');
          setLoading(false);
          return;
        }
      } else if (!thumbnailUrl) {
        toast.error('Please upload an image or provide an image URL');
        setLoading(false);
        return;
      }

      const courseRef = doc(db, 'courses', editingCourse.id);
      await updateDoc(courseRef, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        duration: formData.duration.trim(),
        level: formData.level,
        thumbnailUrl,
        price: parseFloat(formData.price),
        updatedAt: new Date().toISOString(),
      });

      toast.success('Course updated successfully');
      setEditDialogOpen(false);
      setImageFile(null);
      setImagePreview('');
      loadCourses();
    } catch (error: any) {
      console.error('Error updating course:', error);
      if (error.code === 'permission-denied') {
        toast.error('You do not have permission to update courses.');
      } else {
        toast.error('Failed to update course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteDoc(doc(db, 'courses', courseId));
      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error) {
      toast.error('Failed to delete course');
      console.error(error);
    }
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/coordinator/course-details/${courseId}`);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Courses</h2>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No courses available yet.</p>
        ) : (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {course.thumbnailUrl && (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-20 h-20 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.category} - {course.level}</p>
                  <p className="text-sm font-medium mt-1">₦{course.price.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(course.id)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(course)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course details and pricing.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Course Title *</Label>
              <Input
                id="edit-title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Input
                  id="edit-category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration *</Label>
                <Input
                  id="edit-duration"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₦) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-level">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <Label htmlFor="edit-image-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline">Click to upload</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
                    <Input
                      id="edit-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-thumbnailUrl">Or paste image URL</Label>
                  <Input
                    id="edit-thumbnailUrl"
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    disabled={!!imageFile}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Course'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

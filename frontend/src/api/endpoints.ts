import { apiClient } from './client';
import type { AuthUser } from '../store/slices/authSlice';

export type Species = 'Dog' | 'Cat' | 'Other';

export interface PetDto {
  id: string;
  name: string;
  species: Species;
  breed: string | null;
  dateOfBirth: string | null;
  notes: string | null;
}

export interface VaccinationDto {
  id: string;
  name: string;
  dateAdministered: string;
  nextDueDate: string | null;
}

export interface ConditionDto {
  id: string;
  name: string;
  diagnosedDate: string;
  notes: string | null;
}

export interface PetDetailDto extends PetDto {
  vaccinations: VaccinationDto[];
  conditions: ConditionDto[];
}

export interface PetFormPayload {
  name: string;
  species: Species;
  breed?: string | null;
  dateOfBirth?: string | null;
  notes?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export interface UpdateMePayload {
  phone: string;
  address: string;
}

export async function getMe(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>('/me');
  return response.data;
}

export async function updateMe(payload: UpdateMePayload): Promise<AuthUser> {
  const response = await apiClient.put<AuthUser>('/me', payload);
  return response.data;
}

export async function postLogin(payload: LoginPayload): Promise<void> {
  await apiClient.post('/auth/login', payload);
}

export async function postSignup(payload: SignupPayload): Promise<void> {
  await apiClient.post('/auth/signup', payload);
}

export async function postLogout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getPets(): Promise<PetDto[]> {
  const response = await apiClient.get<PetDto[]>('/pets');
  return response.data;
}

export async function getPet(id: string): Promise<PetDetailDto> {
  const response = await apiClient.get<PetDetailDto>(`/pets/${id}`);
  return response.data;
}

export async function createPet(payload: PetFormPayload): Promise<PetDto> {
  const response = await apiClient.post<PetDto>('/pets', payload);
  return response.data;
}

export async function updatePet(id: string, payload: PetFormPayload): Promise<PetDto> {
  const response = await apiClient.put<PetDto>(`/pets/${id}`, payload);
  return response.data;
}

export async function deletePet(id: string): Promise<void> {
  await apiClient.delete(`/pets/${id}`);
}

export type AppointmentStatus = 'Booked' | 'Cancelled' | 'Completed';

export interface AppointmentDto {
  id: string;
  petId: string;
  petName: string;
  vetId: string;
  vetName: string;
  serviceId: string;
  serviceName: string;
  slotId: string;
  slotStartTime: string;
  slotEndTime: string;
  status: AppointmentStatus;
  createdAt: string;
  invoiceNumber: string;
}

export interface VetDto {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  specialties: string;
}

export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface AvailabilitySlotDto {
  id: string;
  startTime: string;
  endTime: string;
}

export interface CreateAppointmentPayload {
  petId: string;
  vetId: string;
  serviceId: string;
  slotId: string;
}

export async function getAppointments(scope: 'upcoming' | 'past'): Promise<AppointmentDto[]> {
  const response = await apiClient.get<AppointmentDto[]>('/appointments', { params: { scope } });
  return response.data;
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<AppointmentDto> {
  const response = await apiClient.post<AppointmentDto>('/appointments', payload);
  return response.data;
}

export async function cancelAppointment(id: string): Promise<void> {
  await apiClient.delete(`/appointments/${id}`);
}

export async function getVets(serviceId?: string): Promise<VetDto[]> {
  const response = await apiClient.get<VetDto[]>('/vets', {
    params: serviceId ? { serviceId } : undefined,
  });
  return response.data;
}

export async function getServices(): Promise<ServiceDto[]> {
  const response = await apiClient.get<ServiceDto[]>('/services');
  return response.data;
}

export async function getAvailability(
  vetId: string,
  serviceId: string,
  from: string,
  to: string,
): Promise<AvailabilitySlotDto[]> {
  const response = await apiClient.get<AvailabilitySlotDto[]>('/availability', {
    params: { vetId, serviceId, from, to },
  });
  return response.data;
}

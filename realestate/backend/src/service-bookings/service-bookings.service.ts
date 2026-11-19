import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/guards/central-auth.guard';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto';
import { UpdateServiceBookingDto } from './dto/update-service-booking.dto';

@Injectable()
export class ServiceBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customer: RequestUser, dto: CreateServiceBookingDto) {
    const provider = await this.prisma.realServiceProvider.findUnique({ where: { id: dto.providerId } });
    if (!provider) throw new NotFoundException('Service provider not found');

    const booking = await this.prisma.realServiceBooking.create({
      data: {
        providerId: dto.providerId,
        customerId: customer.id,
        serviceName: dto.serviceName,
        scheduledAt: new Date(dto.scheduledAt),
        amount: dto.amount,
      },
    });

    await this.prisma.realNotification.create({
      data: {
        userId: provider.userId,
        type: 'SYSTEM',
        title: 'New booking received',
        body: `${dto.serviceName} booked for ${new Date(dto.scheduledAt).toLocaleString()}.`,
      },
    });

    return { message: 'Booking created', booking };
  }

  async findMyBookingsAsCustomer(customerId: string) {
    const bookings = await this.prisma.realServiceBooking.findMany({
      where: { customerId },
      include: { provider: true },
      orderBy: { scheduledAt: 'desc' },
    });
    return { bookings };
  }

  async findMyBookingsAsProvider(userId: string) {
    // Deliberately returns { bookings: [] } rather than throwing 404 when no
    // provider profile exists yet — same reasoning as
    // ProvidersService.findMine(): "no profile yet, so obviously zero
    // bookings" is a normal empty state for this dashboard page, not an
    // error. Throwing here made the frontend's bookings/earnings pages show
    // a red error banner instead of their built-in "set up your profile"
    // empty state — confirmed via test-frontend-e2e-extended.mjs.
    const provider = await this.prisma.realServiceProvider.findUnique({ where: { userId } });
    if (!provider) return { bookings: [] };

    const bookings = await this.prisma.realServiceBooking.findMany({
      where: { providerId: provider.id },
      include: { customer: { select: { id: true, name: true, phone: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    return { bookings };
  }

  async updateStatus(id: string, requester: RequestUser, dto: UpdateServiceBookingDto) {
    const booking = await this.prisma.realServiceBooking.findUnique({
      where: { id },
      include: { provider: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const isAdmin = requester.roles.includes('ADMIN' as any);
    const isOwningProvider = booking.provider.userId === requester.id;
    if (!isOwningProvider && !isAdmin) {
      throw new ForbiddenException('Only the assigned provider can update this booking');
    }

    const updated = await this.prisma.realServiceBooking.update({ where: { id }, data: dto });
    return { message: 'Booking updated', booking: updated };
  }
}
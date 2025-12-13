import { ClsService } from 'nestjs-cls';

export function tenantWhere(cls: ClsService) {
  const tenantId = cls.get('tenantId');
  const role = cls.get('userRole');

  if (role === 'SUPER_ADMIN') return {}; // no tenant filter
  if (!tenantId) return { tenantId: '__NO_TENANT__' }; // fail closed

  return { tenantId };
}

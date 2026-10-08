import { CurrentUser } from '@/services/auth';

export default (initialState: { currentUser?: CurrentUser }) => {
  const { currentUser } = initialState || {};
  return {
    canAccess: !!currentUser,
  };
};

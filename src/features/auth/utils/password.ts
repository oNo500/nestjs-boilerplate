export const validatePasswordStrength = (password: string) => {
  // 1. 密码长度校验
  if (password.length < 8) {
    return false;
  }
  // TODO: 根据实际规则补全
  return true;
};

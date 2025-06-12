// export function GlobalErrorBoundary({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ErrorBoundary
//       FallbackComponent={ErrorFallback}
//       onError={(error, errorInfo) => {
//         console.error('Global error:', error, errorInfo);
//         // 发送到错误监控服务
//       }}
//     >
//       {children}
//     </ErrorBoundary>
//   );
// }

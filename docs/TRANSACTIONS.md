# Database Transactions Guide

## Overview

This document explains how database transactions are implemented in the Coffee Management System to ensure data consistency and integrity.

## What is a Transaction?

A database transaction is a sequence of operations performed as a single logical unit of work. A transaction has four key properties (ACID):

- **Atomicity**: All operations succeed or all fail (no partial updates)
- **Consistency**: Database remains in a valid state
- **Isolation**: Concurrent transactions don't interfere with each other
- **Durability**: Committed changes persist even after system failure

## Transaction Implementation

We use **Drizzle ORM's** `db.transaction()` method to wrap critical operations:

```typescript
const result = await db.transaction(async (tx) => {
    // All database operations here are atomic
    await tx.insert(table1).values(...)
    await tx.update(table2).set(...).where(...)
    await tx.delete(table3).where(...)

    // If any operation fails, entire transaction rolls back
    return result
})
```

## Critical Operations with Transactions

### 1. Order Creation (`orderService.create`)

**Why Transaction?** Creating an order involves multiple tables that must remain consistent.

```typescript
await db.transaction(async (tx) => {
    // 1. Create order
    const order = await tx.insert(orders).values({...}).returning()

    // 2. Create order items (multiple rows)
    await tx.insert(orderItems).values([...])

    // 3. Create delivery record (if delivery order)
    if (deliveryOrder) {
        await tx.insert(deliveries).values({...})
    }

    // 4. Create payment record
    await tx.insert(payments).values({...})

    // 5. Clear customer's cart
    await tx.delete(cart).where(eq(cart.customerId, customerId))
})
```

**What This Ensures:**
- If any step fails, NO changes are made to the database
- No orphaned order items without an order
- No payment records without orders
- Cart is only cleared if order succeeds
- Customer never loses cart items without getting an order

**Failure Scenarios Prevented:**
```
❌ Order created, but order items insertion fails → Customer charged for empty order
❌ Order items created, but payment record fails → Untrackable order
❌ Cart cleared, but order creation fails → Customer loses items
✅ TRANSACTION: All or nothing - complete success or complete rollback
```

### 2. Payment Processing (`paymentService.processPayment`)

**Why Transaction?** Payment and order status must be synchronized.

```typescript
await db.transaction(async (tx) => {
    // 1. Update payment record
    const payment = await tx.update(payments).set({
        status: 'COMPLETED',
        transactionId: 'TXN-123',
        paidAt: new Date()
    }).returning()

    // 2. Update order status
    await tx.update(orders).set({
        status: 'ACCEPTED'
    }).where(eq(orders.id, orderId))
})
```

**What This Ensures:**
- Payment and order status are always in sync
- No completed payments with pending orders
- No accepted orders without completed payments

**Failure Scenarios Prevented:**
```
❌ Payment marked complete, but order status update fails → Inconsistent state
❌ Order marked accepted, but payment update fails → Financial discrepancy
✅ TRANSACTION: Both update or neither updates
```

### 3. User Registration (`authService.register`)

**Why Transaction?** User account requires auth data, profile, and verification.

```typescript
await db.transaction(async (tx) => {
    // 1. Create auth user
    const authUser = await tx.insert(authUsers).values({...}).returning()

    // 2. Create user profile
    await tx.insert(userProfiles).values({
        authUserId: authUser.id,
        ...
    })

    // 3. Create verification record
    await tx.insert(verifications).values({
        authUserId: authUser.id,
        code: '123456'
    })
})
```

**What This Ensures:**
- No auth users without profiles
- No profiles without auth users
- No orphaned verification codes
- User can always log in with complete data

**Failure Scenarios Prevented:**
```
❌ Auth user created, but profile creation fails → User can log in but has no name/phone
❌ Profile created, but auth user insertion fails → Profile without login credentials
❌ Verification created, but user creation fails → Orphaned verification code
✅ TRANSACTION: Complete user setup or nothing
```

### 4. Order Cancellation (`orderService.cancelOrder`)

**Why Transaction?** Cancelling requires updating order, delivery, and payment.

```typescript
await db.transaction(async (tx) => {
    // 1. Update order status
    await tx.update(orders).set({ status: 'CANCELLED' })

    // 2. Update delivery status (if exists)
    await tx.update(deliveries).set({ status: 'PENDING' })

    // 3. Refund payment (if completed)
    await tx.update(payments).set({ status: 'REFUNDED' })
})
```

**What This Ensures:**
- Order, delivery, and payment status always match
- Refunds are issued when orders are cancelled
- No partial cancellations

**Failure Scenarios Prevented:**
```
❌ Order cancelled, but payment not refunded → Financial loss for customer
❌ Payment refunded, but order still active → Order fulfillment without payment
❌ Delivery updated, but order status unchanged → Delivery agent confusion
✅ TRANSACTION: Complete cancellation or order remains active
```

### 5. Delivery Agent Assignment (`orderService.assignDeliveryAgent`)

**Why Transaction?** Delivery and order status must update together.

```typescript
await db.transaction(async (tx) => {
    // 1. Update delivery record
    await tx.update(deliveries).set({
        deliveryAgentId: agentId,
        assignedAt: new Date()
    })

    // 2. Update order status
    await tx.update(orders).set({ status: 'ASSIGNED' })
})
```

**What This Ensures:**
- Agent assignment and order status are synchronized
- No assigned deliveries with unassigned orders
- No status changes without agent assignment

**Failure Scenarios Prevented:**
```
❌ Agent assigned, but order status not updated → Customer sees wrong status
❌ Order status updated, but agent not assigned → No one picks up order
✅ TRANSACTION: Both update together
```

## Transaction Best Practices Applied

### ✅ DO: Use Transactions For

1. **Multi-table inserts** that must all succeed
   - Order creation (orders + order_items + payments + deliveries)
   - User registration (auth_users + user_profiles + verifications)

2. **Status synchronization** across tables
   - Payment completion → Order acceptance
   - Order cancellation → Payment refund
   - Delivery assignment → Order status

3. **Critical business operations**
   - Any operation involving money (payments, refunds)
   - Any operation affecting multiple entities (order + cart clear)

### ❌ DON'T: Use Transactions For

1. **Single table operations**
   ```typescript
   // No transaction needed
   await db.insert(coffees).values({...})
   ```

2. **Read-only queries**
   ```typescript
   // No transaction needed
   await db.select().from(orders)
   ```

3. **Non-critical, independent operations**
   ```typescript
   // Email sending should NOT be in transaction
   await emailService.send(...) // External service
   ```

4. **Long-running operations**
   - Keep transactions short to avoid lock contention
   - Move non-DB work outside transaction

## Error Handling in Transactions

```typescript
try {
    const result = await db.transaction(async (tx) => {
        // Database operations
        return data
    })

    // Transaction committed successfully
    return { success: true, data: result }

} catch (error) {
    // Transaction automatically rolled back
    console.error('Transaction failed:', error)
    return { success: false, error: error.message }
}
```

**Automatic Rollback:**
- Any error thrown inside transaction → automatic rollback
- No need for manual rollback
- All changes are undone

## Performance Considerations

### Transaction Overhead

Transactions have slight overhead:
- Lock acquisition
- Rollback log maintenance
- Commit processing

**Optimization:**
```typescript
// ✅ Good: Short transaction
await db.transaction(async (tx) => {
    await tx.insert(...)
    await tx.update(...)
})

// ❌ Bad: Long transaction with slow operations
await db.transaction(async (tx) => {
    await tx.insert(...)
    await slowExternalAPI() // DON'T DO THIS
    await tx.update(...)
})
```

### Isolation Levels

PostgreSQL default: **READ COMMITTED**
- Transactions see committed data
- No dirty reads
- Sufficient for our use case

## Testing Transactions

### Unit Testing

```typescript
test('order creation rollback on failure', async () => {
    const invalidOrder = { /* missing required field */ }

    await expect(
        orderService.create(invalidOrder)
    ).rejects.toThrow()

    // Verify no order was created
    const orders = await db.select().from(orders)
    expect(orders).toHaveLength(0)

    // Verify no order items were created
    const items = await db.select().from(orderItems)
    expect(items).toHaveLength(0)
})
```

### Integration Testing

```typescript
test('payment processing updates order status', async () => {
    const order = await createTestOrder()

    await paymentService.processPayment({
        orderId: order.id,
        customerId: order.customerId,
        paymentMethod: 'CARD'
    })

    // Verify both payment and order updated
    const payment = await db.select().from(payments).where(...)
    expect(payment[0].status).toBe('COMPLETED')

    const updatedOrder = await db.select().from(orders).where(...)
    expect(updatedOrder[0].status).toBe('ACCEPTED')
})
```

## Monitoring Transactions

### Logging Transaction Operations

```typescript
await db.transaction(async (tx) => {
    console.log('[TRANSACTION START] Order creation')

    const order = await tx.insert(orders).values({...})
    console.log('[TRANSACTION] Order created:', order.id)

    await tx.insert(orderItems).values([...])
    console.log('[TRANSACTION] Order items created')

    await tx.insert(payments).values({...})
    console.log('[TRANSACTION] Payment record created')

    console.log('[TRANSACTION COMMIT] Order creation complete')

    return order
})
```

### Detecting Deadlocks

PostgreSQL automatically detects deadlocks and rolls back one transaction.

```typescript
try {
    await db.transaction(async (tx) => { /* ... */ })
} catch (error) {
    if (error.code === '40P01') {
        console.error('Deadlock detected, retry transaction')
        // Implement retry logic
    }
}
```

## Summary

### Transactions in Our System

| Operation | Tables Involved | Why Transaction | Risk Without |
|-----------|----------------|-----------------|--------------|
| Order Creation | orders, order_items, payments, deliveries, cart | Atomicity | Orphaned records, lost cart items |
| Payment Processing | payments, orders | Consistency | Payment/order status mismatch |
| User Registration | auth_users, user_profiles, verifications | Completeness | Incomplete user accounts |
| Order Cancellation | orders, deliveries, payments | Synchronization | Unrefu nded payments |
| Agent Assignment | deliveries, orders | Status sync | Unassigned deliveries |

### Key Benefits

1. **Data Integrity**: No orphaned or inconsistent records
2. **Financial Accuracy**: Payments and orders always match
3. **User Experience**: No partial failures visible to users
4. **System Reliability**: Automatic rollback on errors
5. **Business Logic**: Complex operations remain atomic

### Transaction Guidelines

1. ✅ Use for **multi-table operations**
2. ✅ Use for **critical business logic**
3. ✅ Keep transactions **short**
4. ✅ Handle errors **gracefully**
5. ❌ Don't include **external APIs**
6. ❌ Don't hold for **long computations**
7. ❌ Don't use for **simple reads**

---

**Last Updated**: January 13, 2026
**PostgreSQL Version**: 14+
**Drizzle ORM**: Latest

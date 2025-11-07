import React, { useState } from 'react'

export default function Cart({ cart, onChange }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [receipt, setReceipt] = useState(null)

  const removeItem = async (id) => {
    await fetch('/api/cart/' + id, { method: 'DELETE' })
    onChange && onChange()
  }

  const submitCheckout = async () => {
    const payload = {
      cartItems: cart.items.map(i=> ({ productId: i.productId, qty: i.qty })),
      name, email
    }
    const r = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const j = await r.json()
    if (j.success) {
      setReceipt(j.receipt)
      onChange && onChange()
    } else {
      alert('Checkout failed')
    }
  }

  return (
    <div>
      <h2>Your Cart</h2>
      { cart.items.length === 0 && <p>Cart is empty.</p> }
      <ul>
        {cart.items.map(it => (
          <li key={it.id}>
            {it.name} — ₹ {it.price.toFixed(2)} × {it.qty}
            <button onClick={()=> removeItem(it.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <p><strong>Total:</strong> ₹ {cart.total.toFixed(2)}</p>

      <hr />
      <h3>Checkout</h3>
      <input placeholder="Full name" value={name} onChange={e=> setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=> setEmail(e.target.value)} />
      <button onClick={submitCheckout}>Place Order (mock)</button>

      { receipt && (
        <div className="receipt">
          <h4>Receipt</h4>
          <p>Order ID: {receipt.id}</p>
          <p>Name: {receipt.name}</p>
          <p>Email: {receipt.email}</p>
          <p>Total: ₹ {receipt.total.toFixed(2)}</p>
          <p>Time: {new Date(receipt.timestamp).toLocaleString()}</p>
          <ul>
            {receipt.items.map((it, idx) => (
              <li key={idx}>{it.name} × {it.qty} — ₹ {it.lineTotal.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      ) }
    </div>
  )
}

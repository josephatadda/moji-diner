# Moji Product Overview

Last updated: July 6, 2026

## What Moji Is

Moji is a restaurant operating platform built around a simple idea: restaurants should be able to run a modern QR ordering experience without needing a heavy, all-or-nothing software stack.

At its core, Moji helps restaurant owners create and manage a digital menu, let diners order from their table, track live orders, manage bills, accept payment confirmations, split bills, issue receipts, and optionally run loyalty, staff, analytics, and table-management workflows.

The product is designed to be modular. A restaurant can start with only the essentials, such as restaurant profile and menu management, then enable more tools over time as the business needs them.

## Who It Serves

### Restaurant Owners and Managers

Owners use Moji as their control panel. They can configure the restaurant, manage menu items, monitor orders, review transactions, manage tables, set tax rules, manage staff access, and control optional modules.

### Restaurant Staff

Staff can use Moji to view and progress orders, create manual counter/phone orders, manage table status, and support payment follow-up. Staff access is intended to be role-aware, with PIN-based entry and permissions.

### Diners

Diners use Moji from a QR code at the table. They can browse the menu, customize items, add notes, place orders, track order status, request a bill, pay, split the bill, apply loyalty points, and download receipts.

## Main Product Surfaces

## 1. Owner Dashboard

The dashboard is the restaurant’s operating hub. It is intended to be the place where every restaurant-facing configuration starts.

Current dashboard areas include:

- Overview
- Orders
- Menu
- Tables
- Transactions
- Loyalty
- Analytics
- Staff
- Settings

The dashboard is built to support optional modules. For example, a restaurant may use only menu management, while another restaurant may also enable tables, loyalty, staff, analytics, and payments.

### Dashboard Overview

The overview gives the owner a quick operational snapshot:

- Whether diner ordering is live
- Active order count
- Revenue from served/paid orders
- Menu item count
- Recent orders
- Recent transactions
- Quick actions such as editing menu or accessing QR codes

### Menu Management

The menu module lets restaurants manage the public diner-facing menu.

It supports:

- Categories
- Menu items
- Item prices
- Descriptions
- Preparation times
- Tags
- Featured items
- Sold-out/available states
- Menu preview
- PDF menu export

This is one of the most important modules because it feeds directly into the diner ordering experience.

### Orders

The orders module is for managing active and completed restaurant orders.

It supports:

- Viewing order queues
- Creating manual staff orders
- Searching and filtering orders
- Moving orders through statuses
- Viewing order details
- Tracking order totals and timestamps

Order statuses include pending, in kitchen, ready, served, and paid.

### Settings

Settings is the control panel for restaurant configuration.

It includes:

- Restaurant profile
- Public restaurant details
- Logo and cover information
- Menu QR and PDF settings
- Opening hours
- VAT/tax configuration
- Notifications
- Security settings
- Feature/module controls

The intended product direction is that settings should drive what appears across dashboard, diner menu, receipts, QR pages, and other connected experiences.

### Tables and QR Codes

The tables module manages table records and QR links.

It supports:

- Table list/cards
- Table status
- Table capacity
- QR viewing
- QR download
- Copying table links

This module should be optional because some restaurants may only want a menu without table ordering.

### Transactions

Transactions show payment activity and payment states.

It supports:

- Payment metrics
- Searching
- Filtering
- Exporting CSV
- Payment status display
- Confirm/reject payment actions in backend-ready mode

### Loyalty

The loyalty module supports points and rewards.

It covers:

- Customer profiles
- Points
- Visits
- Spending
- Reward management
- Loyalty settings

In the diner flow, loyalty can appear as phone capture, points earning, points redemption, and updated balance after payment.

### Analytics

Analytics helps restaurants understand performance.

It includes:

- Revenue trend
- Top dishes
- Payment method breakdown
- Loyalty snapshot
- KPI summaries

### Staff

The staff module manages internal team access.

It supports:

- Staff list
- Roles
- PIN display/edit placeholders
- Add staff
- Deactivate/reactivate staff

The intended long-term direction is role-based access control.

## 2. Diner QR Ordering Experience

The diner experience is the customer-facing side of Moji. It is designed as a mobile-first table ordering flow.

The diner journey is:

1. Scan QR code.
2. Open restaurant menu.
3. Browse categories and items.
4. Customize items.
5. Add items to cart.
6. Place order.
7. Track live order status.
8. Request bill once served.
9. Pay or split bill.
10. Receive/download receipt.

### Diner Menu

The menu page shows:

- Restaurant identity
- Table number
- Category tabs
- Item cards
- Tags
- Prices
- Prep times
- Availability states

Items can be added directly or opened in a detail sheet when modifiers or additional customization are needed.

### Item Detail

The item detail flow supports:

- Item image/fallback
- Description
- Price
- Required modifiers
- Optional modifiers
- Special note
- Quantity stepper
- Fixed add-to-order CTA

### Cart

The cart supports:

- Cart item review
- Quantity updates
- Removing items
- Kitchen note field
- VAT/total summary
- Optional loyalty phone capture
- Place order

### Live Orders

After order placement, diners can see:

- Submitted order batches
- Item list per batch
- Order status
- Timeline modal
- Demo served-state action in preview
- Bill request CTA once items are served

### Bill and Payment

The bill flow supports:

- Item summary
- Subtotal
- VAT
- Tips
- Loyalty discount
- Total payable
- Payment method selection

Payment methods currently shown are:

- Bank transfer
- Card
- Cash

The current implementation is mocked/local in preview, but the product architecture includes a self-reported payment model where diners report payment and restaurant staff confirm it.

### Split Bill

Moji supports three split-bill modes:

- Equal split
- By-item split
- Custom amount split

Equal split can generate payment links for other diners. Split participants can open their share and go through the same payment method flow.

### Receipts

After payment, diners can view and download a receipt.

Receipts include:

- Receipt ID
- Restaurant/table
- Date and time
- Items
- Subtotal
- VAT
- Tip
- Loyalty discount
- Total paid
- Payment method

## 3. Authentication and Onboarding

Moji includes owner authentication and setup flows.

### Authentication

Auth pages include:

- Login
- Signup
- Verify email
- Reset password
- Staff login

The interface is designed to feel consistent across all auth pages with shared cards, links, inputs, notices, and Georgia display headings.

### Onboarding

The current onboarding flow helps a restaurant set up:

- Restaurant name
- Public slug
- City
- Phone
- Instagram
- Cuisine
- QR/menu link

The setup flow is simplified and does not currently require payment integration or table setup during onboarding.

## 4. Design System

Moji has an internal design system that defines how the product should look and behave.

It includes:

- Typography
- Colors
- Spacing
- Radius
- Borders
- Elevation
- Motion
- Layout
- Buttons
- Inputs
- Cards
- Modals
- Tables
- Bottom sheets
- Feedback states
- Diner flow patterns
- Dashboard component patterns

The system uses Georgia for expressive headings and Geist Sans for operational UI such as forms, labels, buttons, tables, controls, and dashboard screens.

## 5. Current Product State

Moji currently has a strong front-end product prototype with:

- A polished diner ordering flow
- A modular dashboard direction
- Local menu-to-diner sync
- Local settings persistence
- Mocked order/payment/loyalty behavior
- Backend schemas and services scaffolded for production
- API routes for orders, payments, loyalty, onboarding, and auth
- A growing design system

Some parts are production-oriented, while others are still preview/local. The product is not yet fully production-ready because several flows still need durable backend persistence and deeper sync between dashboard, diner, and server data.

## 6. What Moji Does Well Today

Moji currently demonstrates the full intended restaurant workflow:

- Restaurants can manage a menu.
- Diners can order from a QR menu.
- Diners can track order status.
- Diners can request and pay bills.
- Diners can split bills.
- Diners can download receipts.
- Owners can view dashboard modules.
- Owners can configure profile/settings locally.
- The product supports optional module thinking.

## 7. What Still Needs to Mature

For production readiness, Moji still needs:

- Real account/session enforcement.
- Backend persistence for settings, menu, orders, payments, tables, loyalty, and staff.
- Real file uploads for logos, covers, and item images.
- Real dashboard-to-diner sync through the backend.
- Production-ready order placement from diner to dashboard.
- Payment reporting and staff confirmation wired into transactions.
- Persistent split bill tokens and multi-user payment state.
- Complete module enable/disable enforcement.
- Comprehensive QA and automated E2E coverage.

## 8. Product Vision

Moji should become a flexible restaurant control system where each restaurant can choose the tools it needs.

The ideal product model is:

- Start simple with restaurant profile and digital menu.
- Add QR/table ordering when ready.
- Add payments and receipts when operationally needed.
- Add loyalty when the restaurant wants repeat-customer tooling.
- Add staff access as teams grow.
- Add analytics as the restaurant wants business intelligence.

The dashboard should remain the source of truth, and diner-facing experiences should reflect dashboard configuration automatically.

## 9. One-Sentence Summary

Moji is a modular restaurant dashboard and QR ordering platform that helps restaurants manage menus, take table orders, handle bills and split payments, issue receipts, and gradually enable operational tools like loyalty, staff, tables, transactions, and analytics.

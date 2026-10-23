<?php
require __DIR__ . '/../../backend-php/lib/church-mgmt/dues.php';

assert(cm_fee_is_paid(1000, 600) === false, 'partial must be unpaid');
assert(cm_fee_is_paid(1000, 1000) === true, 'full pay must be paid');
$sync = cm_sync_fee_paid_columns(1000, 600, '2026-07-01');
assert((int) $sync['paid'] === 0, 'partial paid flag');
assert($sync['paid_date'] === '2026-07-01', 'keep payment date on partial');
echo "dues helpers OK\n";

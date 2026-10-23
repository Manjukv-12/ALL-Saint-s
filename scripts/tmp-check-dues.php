<?php
$pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=projectdb_local;charset=utf8mb4', 'root', '');
$c = $pdo->query('SELECT COUNT(*) c FROM cm_membership_fees')->fetch();
echo 'fee_rows=' . $c['c'] . PHP_EOL;
$c2 = $pdo->query('SELECT COUNT(*) c FROM cm_membership_payments')->fetch();
echo 'payment_rows=' . $c2['c'] . PHP_EOL;
$stmt = $pdo->query(
    'SELECT p.full_name, f.family_code, COUNT(*) months, SUM(mf.amount_due) total
     FROM cm_membership_fees mf
     JOIN cm_persons p ON p.id = mf.person_id
     JOIN cm_families f ON f.id = p.family_id
     WHERE mf.deleted_at IS NULL AND mf.year = 2026
     GROUP BY p.id, p.full_name, f.family_code'
);
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo json_encode($row) . PHP_EOL;
}

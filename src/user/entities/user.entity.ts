// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';

// @Entity()
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   firstName: string;

//   @Column()
//   lastName: string;

//   @Column({ unique: true })
//   email: string;

//   @Column({ type: 'date' })
//   dob: string;

//   @Column({ type: 'enum', enum: ['created', 'updated', 'blocked'] })
//   status: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }
